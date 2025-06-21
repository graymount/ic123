#!/bin/bash

# Python虚拟环境安装脚本
# 解决externally-managed-environment问题

set -e

echo "🐍 设置Python虚拟环境..."

cd crawler

# 检查是否已存在虚拟环境
if [ -d "venv" ]; then
    echo "📁 虚拟环境已存在，激活中..."
    source venv/bin/activate
else
    echo "📦 创建Python虚拟环境..."
    python3 -m venv venv
    
    echo "✅ 激活虚拟环境..."
    source venv/bin/activate
    
    echo "⬆️ 升级pip..."
    pip install --upgrade pip
fi

echo "📦 安装爬虫依赖..."
pip install -r requirements.txt

echo "📁 创建日志目录..."
mkdir -p logs

echo "✅ Python环境设置完成！"
echo ""
echo "🔧 使用方法："
echo "   cd crawler"
echo "   source venv/bin/activate    # 激活虚拟环境"
echo "   python main.py status       # 运行爬虫"
echo "   deactivate                  # 退出虚拟环境"

cd ..