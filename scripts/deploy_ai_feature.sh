#!/bin/bash

# IC123 AI新闻概要功能部署脚本
# 用于部署AI新闻概要生成功能的完整系统

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 未安装"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    log_success "系统依赖检查完成"
}

# 数据库升级
upgrade_database() {
    log_info "开始数据库升级..."
    
    # 检查数据库升级脚本是否存在
    if [ -f "database/add_ai_summary_fields.sql" ]; then
        log_info "发现AI概要字段升级脚本"
        log_warning "请手动执行以下SQL脚本到您的Supabase数据库:"
        echo "database/add_ai_summary_fields.sql"
        echo ""
        echo "按回车键继续，确认您已执行数据库升级脚本..."
        read -r
    else
        log_error "数据库升级脚本不存在: database/add_ai_summary_fields.sql"
        exit 1
    fi
    
    log_success "数据库升级完成"
}

# 部署爬虫服务
deploy_crawler() {
    log_info "部署爬虫服务..."
    
    cd crawler
    
    # 检查环境文件
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log_warning "未找到.env文件，正在从.env.example创建"
            cp .env.example .env
            log_warning "请编辑 crawler/.env 文件并配置正确的环境变量"
            echo "按回车键继续..."
            read -r
        else
            log_error "环境配置文件不存在"
            exit 1
        fi
    fi
    
    # 创建虚拟环境（如果不存在）
    if [ ! -d "venv" ]; then
        log_info "创建Python虚拟环境..."
        python3 -m venv venv
    fi
    
    # 激活虚拟环境并安装依赖
    log_info "安装Python依赖..."
    source venv/bin/activate
    pip install -r requirements.txt
    
    # 测试爬虫连接
    log_info "测试爬虫连接..."
    python main.py status
    
    cd ..
    log_success "爬虫服务部署完成"
}

# 部署后端服务
deploy_backend() {
    log_info "部署后端服务..."
    
    cd backend
    
    # 安装依赖
    log_info "安装后端依赖..."
    npm install
    
    # 构建项目
    log_info "构建后端项目..."
    npm run build
    
    # 运行类型检查
    log_info "运行类型检查..."
    npm run lint
    
    cd ..
    log_success "后端服务部署完成"
}

# 部署前端服务
deploy_frontend() {
    log_info "部署前端服务..."
    
    cd frontend
    
    # 安装依赖
    log_info "安装前端依赖..."
    npm install
    
    # 运行类型检查
    log_info "运行类型检查..."
    npm run type-check
    
    # 构建项目
    log_info "构建前端项目..."
    npm run build
    
    cd ..
    log_success "前端服务部署完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."
    
    # 启动爬虫调度器（后台运行）
    log_info "启动爬虫调度器..."
    cd crawler
    source venv/bin/activate
    nohup python main.py schedule > logs/scheduler.log 2>&1 &
    CRAWLER_PID=$!
    echo $CRAWLER_PID > crawler_scheduler.pid
    cd ..
    
    log_success "爬虫调度器已启动 (PID: $CRAWLER_PID)"
    
    # 启动后端服务（后台运行）
    log_info "启动后端服务..."
    cd backend
    nohup npm run dev > logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > backend.pid
    cd ..
    
    log_success "后端服务已启动 (PID: $BACKEND_PID)"
    
    # 启动前端服务
    log_info "启动前端服务..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > frontend.pid
    cd ..
    
    log_success "前端服务已启动 (PID: $FRONTEND_PID)"
}

# 运行AI概要生成测试
test_ai_feature() {
    log_info "测试AI概要生成功能..."
    
    cd crawler
    source venv/bin/activate
    
    # 运行AI概要生成任务
    python main.py ai-summary
    
    cd ..
    log_success "AI概要生成测试完成"
}

# 显示服务状态
show_status() {
    log_info "服务状态:"
    echo ""
    echo "🤖 爬虫调度器: http://localhost:8000"
    echo "🌐 后端API: http://localhost:8787"
    echo "💻 前端应用: http://localhost:3000"
    echo ""
    log_info "查看日志:"
    echo "- 爬虫日志: crawler/logs/"
    echo "- 后端日志: backend/logs/"
    echo "- 前端日志: frontend/logs/"
    echo ""
    log_info "管理命令:"
    echo "- 停止所有服务: ./scripts/stop_services.sh"
    echo "- 手动运行爬虫: cd crawler && python main.py news"
    echo "- 手动生成AI概要: cd crawler && python main.py ai-summary"
}

# 主函数
main() {
    log_info "开始部署IC123 AI新闻概要功能..."
    echo ""
    
    # 检查当前目录
    if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ] && [ ! -d "crawler" ]; then
        log_error "请在IC123项目根目录下运行此脚本"
        exit 1
    fi
    
    # 执行部署步骤
    check_dependencies
    upgrade_database
    deploy_crawler
    deploy_backend
    deploy_frontend
    
    # 询问是否启动服务
    echo ""
    log_info "是否现在启动所有服务? (y/n)"
    read -r -p "请选择: " choice
    case "$choice" in
        y|Y|yes|Yes)
            start_services
            test_ai_feature
            show_status
            ;;
        *)
            log_info "跳过服务启动。您可以稍后手动启动服务。"
            ;;
    esac
    
    echo ""
    log_success "🎉 IC123 AI新闻概要功能部署完成!"
    echo ""
    log_info "功能说明:"
    echo "✅ 自动新闻爬取并生成AI概要"
    echo "✅ 每天定时更新（6:00, 12:00, 18:00）"
    echo "✅ 支持多种AI服务（OpenAI, Claude, Gemini）"
    echo "✅ 前端优先显示AI概要"
    echo "✅ 智能关键词提取"
    echo ""
}

# 执行主函数
main "$@"