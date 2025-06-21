#!/bin/bash

# 创建演示配置文件

echo "📝 创建演示配置文件..."

# 创建后端演示配置
cat > backend/.env << 'EOF'
# 演示配置 - 请替换为真实Supabase配置
SUPABASE_URL=https://demo-project-id.supabase.co
SUPABASE_ANON_KEY=demo-anon-key
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key

# 应用配置
NODE_ENV=development
PORT=3001
API_PREFIX=/api

# 安全配置
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 日志配置
LOG_LEVEL=info
EOF

# 创建前端演示配置
cat > frontend/.env.local << 'EOF'
# 演示配置 - 请替换为真实配置
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://demo-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key

# 应用配置
NEXT_PUBLIC_APP_NAME=IC123
NEXT_PUBLIC_APP_DESCRIPTION=IC行业信息聚合平台
EOF

# 创建爬虫演示配置
cat > crawler/.env << 'EOF'
# 演示配置 - 请替换为真实Supabase配置
SUPABASE_URL=https://demo-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key

# 爬虫配置
USER_AGENT=IC123-Crawler/1.0
CRAWL_DELAY=1
CONCURRENT_REQUESTS=2
DOWNLOAD_TIMEOUT=30

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=crawler.log

# 调度配置
SCHEDULE_NEWS_HOURS=6,12,18
SCHEDULE_WEBSITES_DAYS=7
EOF

echo "✅ 演示配置文件创建完成！"
echo ""
echo "📁 创建的文件："
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo "   - crawler/.env"
echo ""
echo "⚠️ 注意：这些是演示配置，需要替换为真实的Supabase配置！"
echo ""
echo "🔗 获取Supabase配置："
echo "1. 访问 https://supabase.com"
echo "2. 创建新项目"
echo "3. 在设置中找到API配置"
echo "4. 替换上述文件中的demo-xxx值"