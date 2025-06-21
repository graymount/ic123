import re
import jieba
import hashlib
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from urllib.parse import urljoin, urlparse
from loguru import logger
import requests
from config.settings import WEBSITE_CHECK_TIMEOUT, WEBSITE_CHECK_KEYWORDS, CONTENT_MIN_LENGTH

def clean_text(text: str) -> str:
    """清理文本内容"""
    if not text:
        return ""
    
    # 去除HTML标签
    text = re.sub(r'<[^>]+>', '', text)
    # 去除多余的空白字符
    text = re.sub(r'\s+', ' ', text)
    # 去除首尾空白
    text = text.strip()
    
    return text

def extract_summary(content: str, max_length: int = 200) -> str:
    """从内容中提取摘要"""
    if not content:
        return ""
    
    # 清理内容
    clean_content = clean_text(content)
    
    # 如果内容长度小于最大长度，直接返回
    if len(clean_content) <= max_length:
        return clean_content
    
    # 尝试在句号处截断
    sentences = clean_content.split('。')
    summary = ""
    
    for sentence in sentences:
        if len(summary + sentence + '。') <= max_length:
            summary += sentence + '。'
        else:
            break
    
    # 如果没有找到合适的句号截断点，直接截断
    if not summary:
        summary = clean_content[:max_length - 3] + "..."
    
    return summary

def parse_date(date_str: str) -> Optional[str]:
    """解析各种格式的日期字符串"""
    if not date_str:
        return None
    
    # 常见的日期格式
    date_patterns = [
        r'(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})',  # 2024-01-01 12:00:00
        r'(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{1,2})',           # 2024-01-01 12:00
        r'(\d{4})-(\d{1,2})-(\d{1,2})',                                  # 2024-01-01
        r'(\d{4})年(\d{1,2})月(\d{1,2})日',                              # 2024年1月1日
        r'(\d{1,2})月(\d{1,2})日',                                       # 1月1日
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, date_str)
        if match:
            try:
                groups = match.groups()
                if len(groups) >= 3:
                    year = int(groups[0]) if len(groups[0]) == 4 else datetime.now().year
                    month = int(groups[1] if len(groups) > 2 else groups[0])
                    day = int(groups[2] if len(groups) > 2 else groups[1])
                    hour = int(groups[3]) if len(groups) > 3 else 0
                    minute = int(groups[4]) if len(groups) > 4 else 0
                    second = int(groups[5]) if len(groups) > 5 else 0
                    
                    dt = datetime(year, month, day, hour, minute, second, tzinfo=timezone.utc)
                    return dt.isoformat()
            except (ValueError, IndexError):
                continue
    
    # 如果解析失败，返回当前时间
    logger.warning(f"Failed to parse date: {date_str}")
    return datetime.now(timezone.utc).isoformat()

def generate_content_hash(content: str) -> str:
    """生成内容哈希值，用于去重"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

def extract_keywords(text: str, max_keywords: int = 10) -> List[str]:
    """从文本中提取关键词"""
    if not text:
        return []
    
    # 使用jieba分词
    words = jieba.lcut(text)
    
    # 过滤停用词和短词
    stop_words = {'的', '是', '在', '有', '和', '与', '及', '或', '但', '等', '了', '也', '就', '都', '会', '能', '要', '可', '不', '没', '没有', '之', '为', '上', '下', '中', '对', '从', '到', '由', '被', '把', '给', '让', '使', '向', '往', '去', '来', '过', '着', '了', '的'}
    
    keywords = []
    for word in words:
        if len(word) >= 2 and word not in stop_words and not word.isdigit():
            keywords.append(word)
    
    # 去重并返回前N个关键词
    return list(dict.fromkeys(keywords))[:max_keywords]

def normalize_url(url: str, base_url: str = None) -> str:
    """标准化URL"""
    if not url:
        return ""
    
    # 如果是相对URL，转换为绝对URL
    if base_url and not url.startswith(('http://', 'https://')):
        url = urljoin(base_url, url)
    
    # 移除URL末尾的斜杠
    url = url.rstrip('/')
    
    return url

def is_valid_ic_content(text: str) -> bool:
    """检查内容是否与IC行业相关"""
    if not text or len(text) < CONTENT_MIN_LENGTH:
        return False
    
    text_lower = text.lower()
    
    # 检查是否包含IC相关关键词
    for keyword in WEBSITE_CHECK_KEYWORDS:
        if keyword.lower() in text_lower:
            return True
    
    return False

def check_website_availability(url: str) -> Dict[str, Any]:
    """检查网站可用性"""
    result = {
        'available': False,
        'status_code': None,
        'error_message': None,
        'response_time': None
    }
    
    try:
        start_time = datetime.now()
        response = requests.get(
            url, 
            timeout=WEBSITE_CHECK_TIMEOUT,
            headers={'User-Agent': 'IC123-Checker/1.0'},
            allow_redirects=True
        )
        end_time = datetime.now()
        
        result['status_code'] = response.status_code
        result['response_time'] = (end_time - start_time).total_seconds()
        
        if response.status_code == 200:
            result['available'] = True
            
            # 检查内容是否相关
            if not is_valid_ic_content(response.text):
                result['available'] = False
                result['error_message'] = '网站内容与IC行业不相关'
        else:
            result['error_message'] = f'HTTP {response.status_code}'
            
    except requests.exceptions.RequestException as e:
        result['error_message'] = str(e)
    except Exception as e:
        result['error_message'] = f'未知错误: {str(e)}'
    
    return result

def categorize_news_content(title: str, content: str) -> str:
    """根据新闻标题和内容自动分类"""
    title_content = (title + ' ' + content).lower()
    
    # 定义分类关键词
    categories = {
        '制造工艺': ['制造', '工艺', '制程', '7nm', '5nm', '3nm', '晶圆', '代工'],
        '设计工具': ['eda', '设计', 'cadence', 'synopsys', 'mentor'],
        '市场分析': ['市场', '预测', '分析', '增长', '营收', '份额', '报告'],
        '投资并购': ['投资', '并购', '收购', '融资', '上市', '募资', '估值'],
        '技术创新': ['技术', '创新', '突破', '专利', '研发', '算法', '架构'],
        '政策法规': ['政策', '法规', '标准', '规范', '监管', '审查', '制裁'],
        '人事变动': ['人事', '任命', '离职', '加入', 'ceo', 'cto', '高管'],
        '产品发布': ['发布', '推出', '上市', '产品', '芯片', '处理器']
    }
    
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in title_content:
                return category
    
    return '行业动态'  # 默认分类

def validate_news_data(news_data: Dict[str, Any]) -> bool:
    """验证新闻数据的完整性"""
    required_fields = ['title', 'source', 'original_url', 'published_at']
    
    for field in required_fields:
        if not news_data.get(field):
            logger.warning(f"Missing required field: {field}")
            return False
    
    # 检查标题长度
    if len(news_data['title']) < 5:
        logger.warning("Title too short")
        return False
    
    # 检查URL格式
    parsed_url = urlparse(news_data['original_url'])
    if not parsed_url.scheme or not parsed_url.netloc:
        logger.warning("Invalid URL format")
        return False
    
    return True