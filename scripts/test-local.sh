#!/bin/bash

# IC123 本地测试脚本
# 测试所有组件是否正常工作

set -e

echo "🧪 IC123 本地环境测试开始..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试结果统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 执行测试函数
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -n "测试 $test_name ... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 通过${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ 失败${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# 检查依赖环境
echo "📋 检查系统依赖..."

run_test "Node.js版本" "node -v | grep -E 'v1[8-9]|v[2-9][0-9]'"
run_test "npm版本" "npm -v"
run_test "Python版本" "python3 -c 'import sys; exit(0 if sys.version_info >= (3, 8) else 1)'"
run_test "pip版本" "pip3 --version"

echo ""

# 检查项目文件
echo "📁 检查项目文件结构..."

run_test "后端文件" "[ -f 'backend/package.json' ]"
run_test "前端文件" "[ -f 'frontend/package.json' ]"
run_test "爬虫文件" "[ -f 'crawler/requirements.txt' ]"
run_test "数据库脚本" "[ -f 'database/schema.sql' ]"

echo ""

# 检查环境配置
echo "⚙️ 检查环境配置..."

run_test "后端环境配置" "[ -f 'backend/.env' ]"
run_test "前端环境配置" "[ -f 'frontend/.env.local' ]"
run_test "爬虫环境配置" "[ -f 'crawler/.env' ]"

echo ""

# 检查依赖安装
echo "📦 检查依赖安装..."

run_test "后端依赖" "[ -d 'backend/node_modules' ]"
run_test "前端依赖" "[ -d 'frontend/node_modules' ]"

# 检查Python依赖
if python3 -c "import requests, beautifulsoup4, supabase" 2>/dev/null; then
    run_test "爬虫依赖" "true"
else
    run_test "爬虫依赖" "false"
fi

echo ""

# 测试构建
echo "🔨 测试项目构建..."

if run_test "后端TypeScript编译" "cd backend && npx tsc --noEmit"; then
    echo "   后端TypeScript编译通过"
fi

if run_test "前端TypeScript编译" "cd frontend && npx tsc --noEmit"; then
    echo "   前端TypeScript编译通过"
fi

echo ""

# 测试服务启动（如果服务已启动）
echo "🚀 测试服务连接..."

# 检查后端API
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    run_test "后端API连接" "curl -s http://localhost:3001/api/health | grep -q 'success'"
    
    # 测试具体API端点
    run_test "分类API" "curl -s http://localhost:3001/api/categories | grep -q 'success'"
    run_test "网站API" "curl -s http://localhost:3001/api/websites | grep -q 'success'"
    run_test "新闻API" "curl -s http://localhost:3001/api/news | grep -q 'success'"
else
    echo -e "${YELLOW}⚠️ 后端服务未启动，跳过API测试${NC}"
fi

# 检查前端应用
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    run_test "前端应用连接" "curl -s http://localhost:3000 | grep -q 'IC123'"
else
    echo -e "${YELLOW}⚠️ 前端应用未启动，跳过前端测试${NC}"
fi

echo ""

# 测试爬虫功能
echo "🕷️ 测试爬虫功能..."

if run_test "爬虫状态检查" "cd crawler && timeout 30 python main.py status"; then
    echo "   爬虫系统状态正常"
fi

echo ""

# 生成测试报告
echo "📊 测试报告"
echo "========================================="
echo -e "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！系统运行正常${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️ 部分测试失败，请检查以下内容：${NC}"
    
    if [ ! -f "backend/.env" ]; then
        echo "- 配置 backend/.env 文件"
    fi
    
    if [ ! -f "frontend/.env.local" ]; then
        echo "- 配置 frontend/.env.local 文件"
    fi
    
    if [ ! -f "crawler/.env" ]; then
        echo "- 配置 crawler/.env 文件"
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo "- 安装后端依赖: cd backend && npm install"
    fi
    
    if [ ! -d "frontend/node_modules" ]; then
        echo "- 安装前端依赖: cd frontend && npm install"
    fi
    
    echo "- 启动服务: bash scripts/start-backend.sh"
    echo "- 启动前端: bash scripts/start-frontend.sh"
    
    exit 1
fi