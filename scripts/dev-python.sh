#!/bin/bash

# 使用虚拟环境的爬虫启动脚本

cd crawler

if [ ! -d "venv" ]; then
    echo "❌ Python虚拟环境不存在，请先运行: bash scripts/setup-python.sh"
    exit 1
fi

echo "🐍 激活Python虚拟环境..."
source venv/bin/activate

case "${1:-status}" in
    status)
        echo "📊 检查爬虫系统状态..."
        python main.py status
        ;;
    news)
        echo "📰 开始爬取新闻..."
        python main.py news
        ;;
    websites)
        echo "🌐 检查网站状态..."
        python main.py websites
        ;;
    schedule)
        echo "⏰启动定时调度器..."
        python main.py schedule
        ;;
    *)
        echo "使用方法: $0 {status|news|websites|schedule}"
        echo ""
        echo "命令说明:"
        echo "  status    - 检查系统状态 (默认)"
        echo "  news      - 爬取新闻"
        echo "  websites  - 检查网站状态"
        echo "  schedule  - 启动定时调度器"
        ;;
esac

echo "🔚 退出虚拟环境..."
deactivate