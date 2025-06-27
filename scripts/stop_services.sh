#!/bin/bash

# IC123 服务停止脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 停止进程
stop_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p "$pid" > /dev/null 2>&1; then
            log_info "停止 $service_name (PID: $pid)..."
            kill "$pid"
            sleep 2
            
            # 检查进程是否已停止
            if ps -p "$pid" > /dev/null 2>&1; then
                log_warning "强制停止 $service_name..."
                kill -9 "$pid"
            fi
            
            rm -f "$pid_file"
            log_success "$service_name 已停止"
        else
            log_warning "$service_name 进程不存在 (PID: $pid)"
            rm -f "$pid_file"
        fi
    else
        log_warning "$service_name PID文件不存在: $pid_file"
    fi
}

# 停止所有相关Node.js进程
stop_node_processes() {
    log_info "查找并停止IC123相关的Node.js进程..."
    
    # 查找运行在3000和8787端口的进程
    local pids=$(lsof -ti:3000,8787 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        for pid in $pids; do
            if ps -p "$pid" > /dev/null 2>&1; then
                log_info "停止端口占用进程 (PID: $pid)..."
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # 强制停止仍在运行的进程
        pids=$(lsof -ti:3000,8787 2>/dev/null || true)
        if [ -n "$pids" ]; then
            for pid in $pids; do
                if ps -p "$pid" > /dev/null 2>&1; then
                    log_warning "强制停止进程 (PID: $pid)..."
                    kill -9 "$pid" 2>/dev/null || true
                fi
            done
        fi
    fi
}

# 停止Python爬虫进程
stop_python_processes() {
    log_info "查找并停止爬虫相关的Python进程..."
    
    # 查找IC123爬虫进程
    local pids=$(pgrep -f "python.*main.py.*schedule" 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        for pid in $pids; do
            if ps -p "$pid" > /dev/null 2>&1; then
                log_info "停止爬虫进程 (PID: $pid)..."
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # 强制停止仍在运行的进程
        pids=$(pgrep -f "python.*main.py.*schedule" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            for pid in $pids; do
                if ps -p "$pid" > /dev/null 2>&1; then
                    log_warning "强制停止爬虫进程 (PID: $pid)..."
                    kill -9 "$pid" 2>/dev/null || true
                fi
            done
        fi
    fi
}

main() {
    log_info "开始停止IC123所有服务..."
    echo ""
    
    # 停止指定PID文件的服务
    stop_process "frontend/frontend.pid" "前端服务"
    stop_process "backend/backend.pid" "后端服务"
    stop_process "crawler/crawler_scheduler.pid" "爬虫调度器"
    
    # 停止端口占用的进程
    stop_node_processes
    
    # 停止Python爬虫进程
    stop_python_processes
    
    # 清理临时文件
    log_info "清理临时文件..."
    find . -name "*.pid" -type f -delete 2>/dev/null || true
    
    echo ""
    log_success "🛑 所有IC123服务已停止"
    
    # 显示端口状态
    log_info "端口状态检查:"
    echo "端口 3000: $(lsof -ti:3000 2>/dev/null && echo '占用' || echo '空闲')"
    echo "端口 8787: $(lsof -ti:8787 2>/dev/null && echo '占用' || echo '空闲')"
}

main "$@"