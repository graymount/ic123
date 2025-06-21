import os
from dotenv import load_dotenv

load_dotenv()

# Supabase配置
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_ROLE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# 爬虫配置
USER_AGENT = os.getenv('USER_AGENT', 'IC123-Crawler/1.0')
CRAWL_DELAY = int(os.getenv('CRAWL_DELAY', '1'))
CONCURRENT_REQUESTS = int(os.getenv('CONCURRENT_REQUESTS', '2'))
DOWNLOAD_TIMEOUT = int(os.getenv('DOWNLOAD_TIMEOUT', '30'))

# 代理配置
HTTP_PROXY = os.getenv('HTTP_PROXY')
HTTPS_PROXY = os.getenv('HTTPS_PROXY')

# 日志配置
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
LOG_FILE = os.getenv('LOG_FILE', 'crawler.log')

# 调度配置
SCHEDULE_NEWS_HOURS = [int(h) for h in os.getenv('SCHEDULE_NEWS_HOURS', '6,12,18').split(',')]
SCHEDULE_WEBSITES_DAYS = int(os.getenv('SCHEDULE_WEBSITES_DAYS', '7'))

# 新闻源配置
NEWS_SOURCES = [
    {
        'name': '集微网',
        'url': 'https://www.jimwei.com/',
        'rss': 'https://www.jimwei.com/feed',
        'selectors': {
            'title': 'h1.entry-title',
            'content': '.entry-content',
            'summary': '.entry-summary',
            'date': '.entry-date',
            'author': '.entry-author'
        }
    },
    {
        'name': '芯思想',
        'url': 'https://www.xinsiwei.com/',
        'selectors': {
            'list': '.news-list .news-item',
            'title': '.news-title',
            'summary': '.news-summary',
            'link': '.news-link',
            'date': '.news-date'
        }
    },
    {
        'name': '半导体行业观察',
        'url': 'https://www.icbank.cc/',
        'selectors': {
            'list': '.article-list .article-item',
            'title': '.article-title',
            'summary': '.article-summary',
            'link': '.article-link',
            'date': '.article-date'
        }
    }
]

# 网站验证配置
WEBSITE_CHECK_TIMEOUT = 10
WEBSITE_CHECK_KEYWORDS = ['半导体', 'IC', '芯片', '集成电路', 'semiconductor']

# 过滤配置
CONTENT_MIN_LENGTH = 50
DUPLICATE_THRESHOLD_DAYS = 7