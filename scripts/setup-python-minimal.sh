#!/bin/bash

# 最小化Python环境安装脚本
# 只安装核心依赖，避免兼容性问题

set -e

echo "🐍 设置最小化Python环境..."

cd crawler

# 清理现有虚拟环境
if [ -d "venv" ]; then
    echo "🧹 清理现有虚拟环境..."
    rm -rf venv
fi

echo "📦 创建新的Python虚拟环境..."
python3 -m venv venv

echo "✅ 激活虚拟环境..."
source venv/bin/activate

echo "⬆️ 升级pip..."
pip install --upgrade pip

echo "📦 安装最小化依赖..."
pip install requests==2.31.0
pip install beautifulsoup4==4.12.2
pip install feedparser==6.0.10
pip install python-dotenv==1.0.0
pip install supabase==2.3.0
pip install schedule==1.2.0
pip install fake-useragent==1.4.0
pip install jieba==0.42.1
pip install loguru==0.7.2
pip install aiohttp==3.9.1

echo "📁 创建日志目录..."
mkdir -p logs

echo "✅ 最小化Python环境设置完成！"
echo ""
echo "🔧 使用方法："
echo "   cd crawler"
echo "   source venv/bin/activate    # 激活虚拟环境"
echo "   python main.py status       # 运行爬虫"
echo "   deactivate                  # 退出虚拟环境"

cd ..