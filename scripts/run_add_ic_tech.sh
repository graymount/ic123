#!/bin/bash

# 添加ic技术圈到网站导航

echo "🌐 添加ic技术圈到网站导航"
echo "==============================================="

# 设置脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 检查环境变量
if [[ -z "$SUPABASE_URL" ]]; then
    echo "⚠️  请设置SUPABASE_URL环境变量"
    read -p "SUPABASE_URL: " SUPABASE_URL
    export SUPABASE_URL
fi

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
    echo "⚠️  请设置SUPABASE_ANON_KEY环境变量"
    read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    export SUPABASE_ANON_KEY
fi

echo "🔄 开始添加ic技术圈..."

cd "$PROJECT_DIR"
python3 scripts/add_ic_tech_community.py

if [ $? -eq 0 ]; then
    echo "✅ ic技术圈添加完成！"
    echo "💡 刷新网页查看新增的'技术社区'分类"
    echo "🌐 网站: https://www.iccircle.com/"
else
    echo "❌ 添加失败，请检查日志"
fi 