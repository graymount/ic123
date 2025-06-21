#!/bin/bash

# IC123 Cloudflare 部署脚本

set -e

echo "🚀 IC123 Cloudflare 部署开始..."

# 检查必要工具
check_tools() {
    echo "🔍 检查部署工具..."
    
    if ! command -v wrangler &> /dev/null; then
        echo "❌ Wrangler CLI 未安装"
        echo "安装命令: npm install -g wrangler"
        exit 1
    fi
    
    echo "✅ Wrangler CLI 已安装"
}

# 构建前端
build_frontend() {
    echo "📦 构建前端项目..."
    cd frontend
    
    # 临时修改next.config.js为静态导出
    cp next.config.js next.config.js.backup
    
    # 构建
    npm run build
    
    # 恢复配置
    mv next.config.js.backup next.config.js
    
    echo "✅ 前端构建完成"
    cd ..
}

# 构建后端
build_backend() {
    echo "📦 构建后端项目..."
    cd backend
    npm run build
    echo "✅ 后端构建完成"
    cd ..
}

# 部署后端到Workers
deploy_backend() {
    echo "⚡ 部署后端到Cloudflare Workers..."
    cd backend
    
    # 检查是否已登录
    if ! wrangler whoami &> /dev/null; then
        echo "请先登录Cloudflare:"
        wrangler login
    fi
    
    # 部署
    wrangler deploy --env production
    
    echo "✅ 后端部署完成"
    cd ..
}

# 设置环境变量
setup_secrets() {
    echo "🔐 设置环境变量..."
    cd backend
    
    echo "请输入Supabase配置:"
    
    echo -n "SUPABASE_URL: "
    read -r SUPABASE_URL
    echo "$SUPABASE_URL" | wrangler secret put SUPABASE_URL
    
    echo -n "SUPABASE_ANON_KEY: "
    read -r SUPABASE_ANON_KEY
    echo "$SUPABASE_ANON_KEY" | wrangler secret put SUPABASE_ANON_KEY
    
    echo -n "SUPABASE_SERVICE_ROLE_KEY: "
    read -r SUPABASE_SERVICE_ROLE_KEY
    echo "$SUPABASE_SERVICE_ROLE_KEY" | wrangler secret put SUPABASE_SERVICE_ROLE_KEY
    
    echo -n "CORS_ORIGIN (例: https://ic123.pages.dev): "
    read -r CORS_ORIGIN
    echo "$CORS_ORIGIN" | wrangler secret put CORS_ORIGIN
    
    echo "✅ 环境变量设置完成"
    cd ..
}

# 显示部署信息
show_info() {
    echo ""
    echo "🎉 部署完成！"
    echo ""
    echo "📋 部署信息："
    echo "   后端API: https://ic123-backend.你的用户名.workers.dev"
    echo "   前端需要手动部署到Cloudflare Pages"
    echo ""
    echo "📖 前端部署步骤："
    echo "1. 访问 https://dash.cloudflare.com/pages"
    echo "2. 创建新项目，连接Git仓库"
    echo "3. 设置构建命令: cd frontend && npm run build"
    echo "4. 设置输出目录: frontend/out"
    echo "5. 添加环境变量:"
    echo "   NEXT_PUBLIC_API_URL=https://ic123-backend.你的用户名.workers.dev/api"
    echo "   NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase公钥"
    echo ""
    echo "🔗 有用链接："
    echo "   Cloudflare Dashboard: https://dash.cloudflare.com"
    echo "   详细部署文档: deploy/cloudflare-pages.md"
}

# 主函数
main() {
    case "${1:-all}" in
        frontend)
            build_frontend
            echo "前端构建完成，请手动部署到Cloudflare Pages"
            ;;
        backend)
            check_tools
            build_backend
            deploy_backend
            ;;
        secrets)
            setup_secrets
            ;;
        all)
            check_tools
            build_frontend
            build_backend
            setup_secrets
            deploy_backend
            show_info
            ;;
        *)
            echo "使用方法: $0 {frontend|backend|secrets|all}"
            echo ""
            echo "命令说明:"
            echo "  frontend - 只构建前端"
            echo "  backend  - 构建并部署后端"
            echo "  secrets  - 设置环境变量"
            echo "  all      - 完整部署流程"
            exit 1
            ;;
    esac
}

main "$@"