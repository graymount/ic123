#!/bin/bash

# IC123 开发环境一键启动脚本
# 同时启动后端、前端和爬虫调度器

# 检查是否安装了tmux或screen
if command -v tmux &> /dev/null; then
    TERMINAL="tmux"
elif command -v screen &> /dev/null; then
    TERMINAL="screen"
else
    echo "❌ 需要安装 tmux 或 screen 来管理多个终端会话"
    echo "安装方法:"
    echo "  macOS: brew install tmux"
    echo "  Ubuntu: sudo apt install tmux"
    echo "  CentOS: sudo yum install tmux"
    exit 1
fi

echo "🚀 启动IC123开发环境..."

# 检查环境配置
check_config() {
    if [ ! -f "backend/.env" ]; then
        echo "❌ backend/.env 文件不存在，请先运行: bash scripts/setup.sh"
        exit 1
    fi
    
    if [ ! -f "frontend/.env.local" ]; then
        echo "❌ frontend/.env.local 文件不存在，请先运行: bash scripts/setup.sh"
        exit 1
    fi
    
    if [ ! -f "crawler/.env" ]; then
        echo "❌ crawler/.env 文件不存在，请先运行: bash scripts/setup.sh"
        exit 1
    fi
}

# 使用tmux启动
start_with_tmux() {
    # 创建新会话
    tmux new-session -d -s ic123
    
    # 启动后端
    tmux send-keys -t ic123 "cd backend && npm run dev" Enter
    
    # 创建新窗口启动前端
    tmux new-window -t ic123 -n frontend
    tmux send-keys -t ic123:frontend "cd frontend && npm run dev" Enter
    
    # 创建新窗口显示爬虫状态
    tmux new-window -t ic123 -n crawler
    tmux send-keys -t ic123:crawler "cd crawler && echo '爬虫系统准备就绪，可以手动运行:' && echo 'python main.py news     # 爬取新闻' && echo 'python main.py status   # 检查状态' && echo 'python main.py schedule # 启动调度器' && bash" Enter
    
    # 创建监控窗口
    tmux new-window -t ic123 -n monitor
    tmux send-keys -t ic123:monitor "echo '服务监控:' && echo '后端API: http://localhost:3001/api/health' && echo '前端应用: http://localhost:3000' && echo '按 Ctrl+C 然后输入 exit 退出当前窗口' && watch -n 5 'curl -s http://localhost:3001/api/health 2>/dev/null && echo \"✅ 后端正常\" || echo \"❌ 后端异常\"'" Enter
    
    echo "✅ 开发环境已启动！"
    echo ""
    echo "🔗 访问地址："
    echo "   前端应用: http://localhost:3000"
    echo "   后端API:  http://localhost:3001/api/health"
    echo ""
    echo "📱 tmux 使用说明："
    echo "   tmux attach -t ic123     # 连接到会话"
    echo "   Ctrl+B, 数字键          # 切换窗口"
    echo "   Ctrl+B, d               # 分离会话"
    echo "   tmux kill-session -t ic123  # 结束会话"
    echo ""
    echo "等待5秒后自动连接到tmux会话..."
    sleep 5
    tmux attach -t ic123
}

# 使用screen启动
start_with_screen() {
    # 启动后端
    screen -dmS ic123-backend bash -c "cd backend && npm run dev"
    
    # 启动前端
    screen -dmS ic123-frontend bash -c "cd frontend && npm run dev"
    
    echo "✅ 开发环境已启动！"
    echo ""
    echo "🔗 访问地址："
    echo "   前端应用: http://localhost:3000"
    echo "   后端API:  http://localhost:3001/api/health"
    echo ""
    echo "📱 screen 使用说明："
    echo "   screen -r ic123-backend   # 查看后端日志"
    echo "   screen -r ic123-frontend  # 查看前端日志"
    echo "   Ctrl+A, d                 # 分离会话"
    echo ""
    echo "🕷️ 手动启动爬虫："
    echo "   cd crawler && python main.py status"
}

# 停止所有服务
stop_services() {
    echo "🛑 停止IC123开发环境..."
    
    if [ "$TERMINAL" = "tmux" ]; then
        tmux kill-session -t ic123 2>/dev/null || true
    else
        screen -S ic123-backend -X quit 2>/dev/null || true
        screen -S ic123-frontend -X quit 2>/dev/null || true
    fi
    
    # 停止可能的端口占用
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    echo "✅ 开发环境已停止"
}

# 显示状态
show_status() {
    echo "📊 IC123 开发环境状态："
    echo ""
    
    # 检查端口占用
    if lsof -i:3001 &>/dev/null; then
        echo "✅ 后端API (端口3001): 运行中"
        curl -s http://localhost:3001/api/health > /dev/null && echo "   API响应正常" || echo "   API响应异常"
    else
        echo "❌ 后端API (端口3001): 未运行"
    fi
    
    if lsof -i:3000 &>/dev/null; then
        echo "✅ 前端应用 (端口3000): 运行中"
    else
        echo "❌ 前端应用 (端口3000): 未运行"
    fi
    
    echo ""
    
    # 检查tmux会话
    if [ "$TERMINAL" = "tmux" ] && tmux has-session -t ic123 2>/dev/null; then
        echo "✅ tmux会话 'ic123': 活跃"
        echo "   连接命令: tmux attach -t ic123"
    else
        echo "❌ tmux会话 'ic123': 不存在"
    fi
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            check_config
            if [ "$TERMINAL" = "tmux" ]; then
                start_with_tmux
            else
                start_with_screen
            fi
            ;;
        stop)
            stop_services
            ;;
        status)
            show_status
            ;;
        restart)
            stop_services
            sleep 2
            check_config
            if [ "$TERMINAL" = "tmux" ]; then
                start_with_tmux
            else
                start_with_screen
            fi
            ;;
        *)
            echo "使用方法: $0 {start|stop|status|restart}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动开发环境 (默认)"
            echo "  stop    - 停止开发环境"
            echo "  status  - 查看运行状态"
            echo "  restart - 重启开发环境"
            exit 1
            ;;
    esac
}

main "$@"