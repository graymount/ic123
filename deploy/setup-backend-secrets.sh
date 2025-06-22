#!/bin/bash

# IC123 后端部署 - 设置Cloudflare Workers环境变量
# 请在运行此脚本前确保已安装wrangler并登录

echo "🚀 设置IC123后端Cloudflare Workers环境变量..."

# 检查是否已登录wrangler
if ! wrangler whoami > /dev/null 2>&1; then
    echo "❌ 请先登录wrangler: wrangler login"
    exit 1
fi

# 进入后端目录
cd backend

echo "📝 请提供以下Supabase配置信息:"

# 获取Supabase配置
read -p "Supabase URL (例如: https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
read -s -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
echo

# 验证输入
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
    echo "❌ 所有字段都是必需的"
    exit 1
fi

echo "🔐 设置生产环境secrets..."

# 设置生产环境secrets
wrangler secret put SUPABASE_URL --env production <<< "$SUPABASE_URL"
wrangler secret put SUPABASE_ANON_KEY --env production <<< "$SUPABASE_ANON_KEY"
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production <<< "$SUPABASE_SERVICE_ROLE_KEY"

echo "🔐 设置开发环境secrets..."

# 设置开发环境secrets
wrangler secret put SUPABASE_URL --env development <<< "$SUPABASE_URL"
wrangler secret put SUPABASE_ANON_KEY --env development <<< "$SUPABASE_ANON_KEY"
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env development <<< "$SUPABASE_SERVICE_ROLE_KEY"

echo "✅ 环境变量设置完成！"
echo ""
echo "📋 接下来的步骤:"
echo "1. 运行 'npm run dev' 在本地测试"
echo "2. 运行 'npm run deploy' 部署到生产环境"
echo ""
echo "🌐 部署后，你的API将可通过以下地址访问:"
echo "   生产环境: https://ic123-backend.your-subdomain.workers.dev"
echo "   开发环境: https://ic123-backend-dev.your-subdomain.workers.dev" 