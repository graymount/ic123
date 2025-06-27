#!/bin/bash

# 微信公众号数据更新脚本
# 使用方法: ./run_wechat_update.sh

# 设置脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 开始更新微信公众号数据..."
echo "项目目录: $PROJECT_DIR"

# 创建必要的目录
mkdir -p "$PROJECT_DIR/logs"

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3，请先安装Python 3"
    exit 1
fi

# 检查依赖
echo "📦 检查Python依赖..."
python3 -c "import requests" 2>/dev/null || {
    echo "⚠️  requests库未安装，尝试安装..."
    
    # 首先尝试用户级安装
    echo "🔧 尝试用户级安装..."
    pip3 install --user requests 2>/dev/null || {
        # 如果用户级安装失败，提示使用虚拟环境
        echo "❌ 用户级安装失败"
        echo "💡 建议创建虚拟环境："
        echo "   python3 -m venv venv"
        echo "   source venv/bin/activate"
        echo "   pip install requests"
        echo "   然后重新运行此脚本"
        echo ""
        echo "🚀 或者直接运行测试脚本（无需requests）："
        echo "   python3 scripts/test_wechat_update.py"
        
        # 检查是否要继续使用测试脚本
        read -p "是否使用测试脚本继续？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔄 切换到测试脚本..."
            TEST_MODE=true
        else
            echo "❌ 退出安装，请手动解决依赖问题"
            exit 1
        fi
    }
}

# 检查环境变量
if [[ -z "$SUPABASE_URL" ]]; then
    echo "⚠️  SUPABASE_URL 环境变量未设置"
    echo "请设置您的Supabase项目URL:"
    read -p "SUPABASE_URL: " SUPABASE_URL
    export SUPABASE_URL
fi

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
    echo "⚠️  SUPABASE_ANON_KEY 环境变量未设置"
    echo "请设置您的Supabase匿名密钥:"
    read -p "SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
    export SUPABASE_ANON_KEY
fi

# 运行Python脚本
echo "🔄 开始抓取和更新数据..."
cd "$PROJECT_DIR"

# 根据是否为测试模式选择脚本
if [[ "$TEST_MODE" == "true" ]]; then
    echo "🧪 运行测试脚本（使用模拟数据）..."
    python3 scripts/test_wechat_update.py
else
    echo "🕷️  运行完整脚本（从新榜抓取）..."
    python3 scripts/update_wechat_followers.py
fi

# 检查执行结果
if [ $? -eq 0 ]; then
    echo "✅ 数据更新完成!"
    echo "📋 查看日志: logs/wechat_crawler.log"
else
    echo "❌ 数据更新失败，请检查日志"
    exit 1
fi 