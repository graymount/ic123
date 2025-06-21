#!/bin/bash

# IC123 本地开发环境安装脚本
# 使用方法: bash scripts/setup.sh

set -e

echo "🚀 IC123 本地开发环境安装开始..."

# 检查Node.js版本
check_node() {
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js 未安装，请先安装 Node.js >= 18"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js 版本过低，需要 >= 18，当前版本: $(node -v)"
        exit 1
    fi
    
    echo "✅ Node.js 版本检查通过: $(node -v)"
}

# 检查Python版本
check_python() {
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 未安装，请先安装 Python >= 3.8"
        exit 1
    fi
    
    PYTHON_VERSION=$(python3 -c 'import sys; print(sys.version_info.major, sys.version_info.minor)' | tr ' ' '.')
    if python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'; then
        echo "✅ Python 版本检查通过: $(python3 --version)"
    else
        echo "❌ Python 版本过低，需要 >= 3.8，当前版本: $(python3 --version)"
        exit 1
    fi
}

# 安装后端依赖
setup_backend() {
    echo "📦 安装后端依赖..."
    cd backend
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "📝 已创建 backend/.env 文件，请配置Supabase连接信息"
    fi
    
    npm install
    echo "✅ 后端依赖安装完成"
    cd ..
}

# 安装前端依赖
setup_frontend() {
    echo "📦 安装前端依赖..."
    cd frontend
    
    if [ ! -f ".env.local" ]; then
        cp .env.example .env.local
        echo "📝 已创建 frontend/.env.local 文件，请配置API和Supabase连接信息"
    fi
    
    npm install
    echo "✅ 前端依赖安装完成"
    cd ..
}

# 安装爬虫依赖
setup_crawler() {
    echo "📦 安装爬虫依赖..."
    cd crawler
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo "📝 已创建 crawler/.env 文件，请配置Supabase连接信息"
    fi
    
    # 检查pip
    if ! command -v pip3 &> /dev/null; then
        echo "❌ pip3 未安装，请先安装 pip"
        exit 1
    fi
    
    pip3 install -r requirements.txt
    
    # 创建日志目录
    mkdir -p logs
    
    echo "✅ 爬虫依赖安装完成"
    cd ..
}

# 创建启动脚本
create_scripts() {
    echo "📝 创建启动脚本..."
    
    # 后端启动脚本
    cat > scripts/start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 启动后端API服务..."
cd backend && npm run dev
EOF
    
    # 前端启动脚本
    cat > scripts/start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 启动前端应用..."
cd frontend && npm run dev
EOF
    
    # 爬虫测试脚本
    cat > scripts/test-crawler.sh << 'EOF'
#!/bin/bash
echo "🧪 测试爬虫系统..."
cd crawler && python main.py status
EOF
    
    # 使脚本可执行
    chmod +x scripts/*.sh
    
    echo "✅ 启动脚本创建完成"
}

# 显示配置提示
show_config_hints() {
    echo ""
    echo "🔧 配置提示："
    echo "1. 创建Supabase项目: https://supabase.com"
    echo "2. 配置后端环境变量: backend/.env"
    echo "3. 配置前端环境变量: frontend/.env.local"
    echo "4. 配置爬虫环境变量: crawler/.env"
    echo "5. 在Supabase SQL Editor中执行数据库脚本:"
    echo "   - database/schema.sql"
    echo "   - database/seed_data.sql"
    echo "   - database/rls_policies.sql"
    echo ""
    echo "🚀 启动服务："
    echo "   bash scripts/start-backend.sh    # 启动后端 (端口3001)"
    echo "   bash scripts/start-frontend.sh   # 启动前端 (端口3000)"
    echo "   bash scripts/test-crawler.sh     # 测试爬虫"
    echo ""
    echo "📖 访问应用："
    echo "   前端应用: http://localhost:3000"
    echo "   API文档: http://localhost:3001/api/health"
    echo ""
}

# 主函数
main() {
    echo "检查系统环境..."
    check_node
    check_python
    
    echo ""
    echo "安装项目依赖..."
    setup_backend
    setup_frontend
    setup_crawler
    
    echo ""
    create_scripts
    
    echo ""
    echo "✅ IC123 本地开发环境安装完成！"
    show_config_hints
}

# 执行主函数
main