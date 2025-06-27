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
        'name': 'EETimes',
        'rss': 'https://www.eetimes.com/feed/',
        'selectors': {
            'title': 'h1.entry-title',
            'content': '.entry-content',
            'summary': '.entry-summary',
            'date': '.entry-date',
            'author': '.entry-author'
        }
    },
    {
        'name': 'Electronic Design',
        'rss': 'https://www.electronicdesign.com/rss.xml',
        'selectors': {
            'title': 'h1',
            'content': '.content',
            'summary': '.summary',
            'date': '.date',
            'author': '.author'
        }
    },
    {
        'name': 'SemiWiki',
        'url': 'https://www.semiwiki.com/',
        'selectors': {
            'list': '.post-item, .entry',
            'title': '.post-title a, .entry-title a, h2 a',
            'summary': '.post-excerpt, .entry-summary',
            'link': '.post-title a, .entry-title a, h2 a',
            'date': '.post-date, .entry-date'
        }
    }
]

# 网站验证配置
WEBSITE_CHECK_TIMEOUT = 10
WEBSITE_CHECK_KEYWORDS = ['半导体', 'IC', '芯片', '集成电路', 'semiconductor']

# 过滤配置
CONTENT_MIN_LENGTH = 50
DUPLICATE_THRESHOLD_DAYS = 7