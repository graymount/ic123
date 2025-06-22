#!/bin/bash

# IC123 Cloudflare 部署脚本
# 部署前端到 Cloudflare Pages，后端到 Cloudflare Workers

set -e

echo "🚀 开始部署IC123到Cloudflare..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "$1"
}

log "${BLUE}========== IC123 Cloudflare 部署 ==========${NC}"

# 检查必要工具
check_requirements() {
    log "${YELLOW}📋 检查部署要求...${NC}"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log "${RED}❌ Node.js未安装${NC}"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log "${RED}❌ npm未安装${NC}"
        exit 1
    fi
    
    # 检查wrangler
    if ! command -v wrangler &> /dev/null; then
        log "${YELLOW}⚠️ Wrangler未安装，正在安装...${NC}"
        npm install -g wrangler
    fi
    
    log "${GREEN}✅ 环境检查完成${NC}"
}

# 构建前端
build_frontend() {
    log "${YELLOW}🏗️ 构建前端应用...${NC}"
    
    cd frontend
    
    # 安装依赖
    log "安装前端依赖..."
    npm ci
    
    # 设置生产环境变量
    export NODE_ENV=production
    export NEXT_PUBLIC_API_URL="https://ic123-backend.graymount.workers.dev/api"
    
    # 构建项目
    log "构建Next.js应用..."
    npm run build
    
    # 验证构建输出
    if [ ! -d "out" ]; then
        log "${RED}❌ 前端构建失败，out目录不存在${NC}"
        exit 1
    fi
    
    log "${GREEN}✅ 前端构建完成${NC}"
    cd ..
}

# 构建后端
build_backend() {
    log "${YELLOW}⚙️ 构建后端API...${NC}"
    
    cd backend
    
    # 安装依赖
    log "安装后端依赖..."
    npm ci
    
    # 构建项目
    log "构建TypeScript项目..."
    npm run build
    
    # 验证构建输出
    if [ ! -d "dist" ]; then
        log "${RED}❌ 后端构建失败，dist目录不存在${NC}"
        exit 1
    fi
    
    log "${GREEN}✅ 后端构建完成${NC}"
    cd ..
}

# 部署后端到Workers
deploy_backend() {
    log "${YELLOW}🚀 部署后端到Cloudflare Workers...${NC}"
    
    cd backend
    
    # 检查Wrangler登录状态
    if ! wrangler whoami &> /dev/null; then
        log "${YELLOW}请先登录Cloudflare:${NC}"
        wrangler login
    fi
    
    # 部署到生产环境
    log "部署到Workers..."
    wrangler deploy --env production
    
    log "${GREEN}✅ 后端部署完成${NC}"
    log "${BLUE}访问地址: https://ic123-backend.graymount.workers.dev/api/health${NC}"
    cd ..
}

# 部署前端到Pages
deploy_frontend() {
    log "${YELLOW}📄 部署前端到Cloudflare Pages...${NC}"
    
    # 使用wrangler pages部署
    cd frontend
    
    log "部署静态文件到Pages..."
    wrangler pages deploy out --project-name=ic123 --compatibility-date=2024-03-18
    
    log "${GREEN}✅ 前端部署完成${NC}"
    log "${BLUE}访问地址: https://ic123.pages.dev${NC}"
    cd ..
}

# 验证部署
verify_deployment() {
    log "${YELLOW}🔍 验证部署结果...${NC}"
    
    # 等待服务启动
    sleep 10
    
    # 检查后端API
    log "检查后端API..."
    backend_status=$(curl -s -o /dev/null -w "%{http_code}" "https://ic123-backend.graymount.workers.dev/api/health" || echo "000")
    
    if [ "$backend_status" = "200" ]; then
        log "${GREEN}✅ 后端API运行正常${NC}"
    else
        log "${RED}❌ 后端API检查失败 (HTTP: $backend_status)${NC}"
    fi
    
    # 检查前端页面
    log "检查前端页面..."
    frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "https://ic123.pages.dev" || echo "000")
    
    if [ "$frontend_status" = "200" ]; then
        log "${GREEN}✅ 前端页面运行正常${NC}"
    else
        log "${RED}❌ 前端页面检查失败 (HTTP: $frontend_status)${NC}"
    fi
}

# 设置环境变量
setup_secrets() {
    log "${YELLOW}🔐 设置环境变量...${NC}"
    
    cd backend
    
    log "${BLUE}请输入以下环境变量（如果已设置可跳过）:${NC}"
    
    # 检查是否需要设置Supabase变量
    read -p "是否需要设置Supabase环境变量? (y/n): " setup_supabase
    
    if [ "$setup_supabase" = "y" ]; then
        echo "设置Supabase URL:"
        wrangler secret put SUPABASE_URL --env production
        
        echo "设置Supabase匿名密钥:"
        wrangler secret put SUPABASE_ANON_KEY --env production
        
        echo "设置Supabase服务密钥:"
        wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
    fi
    
    # 设置CORS来源
    echo "设置CORS来源为Pages域名:"
    echo "https://ic123.pages.dev" | wrangler secret put CORS_ORIGIN --env production
    
    cd ..
    log "${GREEN}✅ 环境变量设置完成${NC}"
}

# 显示部署信息
show_deployment_info() {
    log "${BLUE}========== 部署完成 ==========${NC}"
    log "${GREEN}🎉 IC123已成功部署到Cloudflare！${NC}"
    log ""
    log "${YELLOW}访问地址:${NC}"
    log "🌐 网站首页: https://ic123.pages.dev"
    log "🔧 API接口: https://ic123-backend.graymount.workers.dev/api"
    log "❤️ 健康检查: https://ic123-backend.graymount.workers.dev/api/health"
    log ""
    log "${YELLOW}管理面板:${NC}"
    log "📊 Pages仪表板: https://dash.cloudflare.com/pages"
    log "⚡ Workers仪表板: https://dash.cloudflare.com/workers"
    log ""
    log "${YELLOW}常用命令:${NC}"
    log "查看Workers日志: wrangler tail --env production"
    log "更新后端: cd backend && wrangler deploy --env production"
    log "更新前端: cd frontend && npm run build && wrangler pages deploy out --project-name=ic123"
    log ""
    log "${GREEN}部署完成！🚀${NC}"
}

# 主函数
main() {
    check_requirements
    
    # 询问部署选项
    echo "请选择部署选项:"
    echo "1) 完整部署（前端+后端）"
    echo "2) 仅部署前端"
    echo "3) 仅部署后端"
    echo "4) 设置环境变量"
    read -p "请输入选择 (1-4): " choice
    
    case $choice in
        1)
            build_frontend
            build_backend
            setup_secrets
            deploy_backend
            deploy_frontend
            verify_deployment
            show_deployment_info
            ;;
        2)
            build_frontend
            deploy_frontend
            ;;
        3)
            build_backend
            setup_secrets
            deploy_backend
            ;;
        4)
            setup_secrets
            ;;
        *)
            log "${RED}无效选择${NC}"
            exit 1
            ;;
    esac
}

# 如果直接运行脚本
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi 