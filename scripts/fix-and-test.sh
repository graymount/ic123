#!/bin/bash

echo "🔧 修复环境并测试..."

# 1. 更新Python依赖
echo "📦 更新Supabase依赖..."
cd crawler
source venv/bin/activate
pip install supabase==2.1.0
deactivate
cd ..

# 2. 创建有效的配置文件（使用占位符）
echo "📝 创建有效配置..."

# 后端配置
cat > backend/.env << 'EOF'
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_ANON_KEY=placeholder-anon-key-must-be-long-enough-to-pass-validation-checks
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key-must-be-long-enough-to-pass-validation-checks

NODE_ENV=development
PORT=3001
API_PREFIX=/api
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
EOF

# 前端配置
cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key-must-be-long-enough-to-pass-validation-checks
NEXT_PUBLIC_APP_NAME=IC123
NEXT_PUBLIC_APP_DESCRIPTION=IC行业信息聚合平台
EOF

# 爬虫配置
cat > crawler/.env << 'EOF'
SUPABASE_URL=https://placeholder.supabase.co
SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key-must-be-long-enough-to-pass-validation-checks

USER_AGENT=IC123-Crawler/1.0
CRAWL_DELAY=1
CONCURRENT_REQUESTS=2
DOWNLOAD_TIMEOUT=30
LOG_LEVEL=INFO
LOG_FILE=crawler.log
SCHEDULE_NEWS_HOURS=6,12,18
SCHEDULE_WEBSITES_DAYS=7
EOF

echo "✅ 配置文件已创建"

# 3. 测试构建
echo "🔨 测试后端构建..."
cd backend
npm run build > /dev/null 2>&1 && echo "✅ 后端构建成功" || echo "❌ 后端构建失败"
cd ..

echo "🔨 测试前端构建..."
cd frontend
npm run type-check > /dev/null 2>&1 && echo "✅ 前端类型检查成功" || echo "❌ 前端类型检查失败"
cd ..

echo ""
echo "📋 修复完成！现在可以："
echo "1. 创建Supabase项目获取真实配置"
echo "2. 或者直接启动查看界面效果（会有数据库连接错误，但界面正常）"
echo ""
echo "🚀 启动命令: bash scripts/dev.sh start"