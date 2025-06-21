#!/bin/bash

# 快速测试脚本 - 测试核心功能

echo "🧪 快速测试IC123系统..."

# 检查虚拟环境
if [ ! -d "crawler/venv" ]; then
    echo "❌ Python虚拟环境不存在，运行安装脚本..."
    bash scripts/setup-python-minimal.sh
fi

echo ""
echo "1️⃣ 测试Python环境..."
cd crawler
source venv/bin/activate

python3 -c "
try:
    import requests, beautifulsoup4, supabase, schedule, loguru
    print('✅ Python依赖正常')
except ImportError as e:
    print(f'❌ Python依赖错误: {e}')
"

echo ""
echo "2️⃣ 测试配置文件..."
if [ -f ".env" ]; then
    echo "✅ 爬虫配置文件存在"
else
    echo "❌ 爬虫配置文件不存在"
fi

deactivate
cd ..

echo ""
echo "3️⃣ 测试后端配置..."
if [ -f "backend/.env" ]; then
    echo "✅ 后端配置文件存在"
else
    echo "❌ 后端配置文件不存在"
fi

echo ""
echo "4️⃣ 测试前端配置..."
if [ -f "frontend/.env.local" ]; then
    echo "✅ 前端配置文件存在"
else
    echo "❌ 前端配置文件不存在"
fi

echo ""
echo "5️⃣ 测试依赖安装..."
if [ -d "backend/node_modules" ]; then
    echo "✅ 后端依赖已安装"
else
    echo "❌ 后端依赖未安装"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ 前端依赖已安装"
else
    echo "❌ 前端依赖未安装"
fi

echo ""
echo "📋 快速测试完成！"
echo ""
echo "🚀 下一步操作："
echo "1. 配置环境变量（如果显示❌）"
echo "2. 创建Supabase项目并执行数据库脚本"
echo "3. 启动服务: bash scripts/dev.sh start"