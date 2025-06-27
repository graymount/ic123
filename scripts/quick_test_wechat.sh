#!/bin/bash

# 快速测试微信公众号数据更新
# 无需安装额外依赖，使用Python内置库

echo "🧪 快速测试微信公众号数据更新"
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

echo "🔄 开始更新公众号粉丝数（使用模拟数据）..."

cd "$PROJECT_DIR"
python3 scripts/test_wechat_update.py

if [ $? -eq 0 ]; then
    echo "✅ 测试完成！公众号粉丝数已更新"
    echo "💡 现在刷新网页应该能看到粉丝数不再是0了"
else
    echo "❌ 测试失败，请检查环境变量和网络连接"
fi 