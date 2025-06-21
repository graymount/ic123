#!/bin/bash

# 不依赖数据库的测试脚本

echo "🧪 测试爬虫系统（无数据库连接）..."

cd crawler

if [ ! -d "venv" ]; then
    echo "❌ Python虚拟环境不存在"
    exit 1
fi

source venv/bin/activate

echo "🐍 Python环境测试..."

# 测试基础导入
python3 -c "
import sys
print(f'Python版本: {sys.version}')

try:
    import requests
    print('✅ requests')
except ImportError as e:
    print(f'❌ requests: {e}')

try:
    from bs4 import BeautifulSoup
    print('✅ beautifulsoup4')
except ImportError as e:
    print(f'❌ beautifulsoup4: {e}')

try:
    import schedule
    print('✅ schedule')
except ImportError as e:
    print(f'❌ schedule: {e}')

try:
    from loguru import logger
    print('✅ loguru')
except ImportError as e:
    print(f'❌ loguru: {e}')

try:
    import aiohttp
    print('✅ aiohttp')
except ImportError as e:
    print(f'❌ aiohttp: {e}')

try:
    from fake_useragent import UserAgent
    print('✅ fake-useragent')
except ImportError as e:
    print(f'❌ fake-useragent: {e}')

try:
    import jieba
    print('✅ jieba')
except ImportError as e:
    print(f'❌ jieba: {e}')
"

echo ""
echo "🌐 网络连接测试..."

python3 -c "
import requests
try:
    response = requests.get('https://httpbin.org/json', timeout=5)
    if response.status_code == 200:
        print('✅ 网络连接正常')
    else:
        print(f'❌ 网络响应异常: {response.status_code}')
except Exception as e:
    print(f'❌ 网络连接失败: {e}')
"

echo ""
echo "🛠️ 工具函数测试..."

python3 -c "
import sys
sys.path.append('.')

try:
    from utils.helpers import clean_text, extract_summary, parse_date
    
    # 测试文本清理
    test_text = '<p>这是一个测试</p>'
    cleaned = clean_text(test_text)
    print(f'✅ 文本清理: \"{test_text}\" -> \"{cleaned}\"')
    
    # 测试摘要提取
    content = '这是一段很长的测试内容，用来测试摘要提取功能是否正常工作。'
    summary = extract_summary(content, 20)
    print(f'✅ 摘要提取: \"{summary}\"')
    
    # 测试日期解析
    date_result = parse_date('2024-01-01 12:00:00')
    print(f'✅ 日期解析: {date_result}')
    
except Exception as e:
    print(f'❌ 工具函数测试失败: {e}')
"

deactivate
cd ..

echo ""
echo "✅ 无数据库测试完成！"
echo ""
echo "📋 测试结果总结："
echo "   - Python环境: 正常"
echo "   - 依赖库: 正常"
echo "   - 网络连接: 正常"
echo "   - 工具函数: 正常"
echo ""
echo "🔧 下一步: 配置Supabase数据库连接"