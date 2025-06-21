import asyncio
import aiohttp
from bs4 import BeautifulSoup
# import feedparser  # 暂时移除，Python 3.13兼容性问题
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from loguru import logger
from urllib.parse import urljoin, urlparse

from config.settings import NEWS_SOURCES, USER_AGENT, CRAWL_DELAY, DUPLICATE_THRESHOLD_DAYS
from utils.database import db
from utils.helpers import (
    clean_text, extract_summary, parse_date, 
    categorize_news_content, validate_news_data, 
    normalize_url, is_valid_ic_content
)

class NewsScraper:
    def __init__(self):
        self.session = None
        self.recent_titles = []

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': USER_AGENT}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def scrape_all_sources(self) -> Dict[str, int]:
        """爬取所有新闻源"""
        logger.info("Starting news scraping for all sources")
        
        # 获取最近的新闻标题用于去重
        self.recent_titles = await db.get_recent_news_titles(DUPLICATE_THRESHOLD_DAYS)
        logger.info(f"Found {len(self.recent_titles)} recent news titles for deduplication")
        
        results = {}
        
        for source_config in NEWS_SOURCES:
            try:
                logger.info(f"Scraping news from: {source_config['name']}")
                
                if 'rss' in source_config:
                    news_items = await self.scrape_rss_feed(source_config)
                else:
                    news_items = await self.scrape_html_source(source_config)
                
                saved_count = 0
                for item in news_items:
                    if await self.save_news_item(item):
                        saved_count += 1
                
                results[source_config['name']] = saved_count
                logger.success(f"Saved {saved_count} news items from {source_config['name']}")
                
                # 添加延迟以避免过于频繁的请求
                await asyncio.sleep(CRAWL_DELAY)
                
            except Exception as e:
                logger.error(f"Error scraping {source_config['name']}: {e}")
                results[source_config['name']] = 0
                await db.save_crawl_log(source_config['name'], 'error', str(e))
        
        total_saved = sum(results.values())
        logger.info(f"News scraping completed. Total saved: {total_saved}")
        return results

    async def scrape_rss_feed(self, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """爬取RSS源 - 暂时禁用，Python 3.13兼容性问题"""
        logger.warning("RSS feed parsing temporarily disabled due to Python 3.13 compatibility issues")
        return []

    async def scrape_html_source(self, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """爬取HTML源"""
        news_items = []
        
        try:
            async with self.session.get(source_config['url']) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # 根据配置的选择器提取新闻列表
                    article_elements = soup.select(source_config['selectors']['list'])
                    
                    for element in article_elements:
                        try:
                            title_elem = element.select_one(source_config['selectors']['title'])
                            link_elem = element.select_one(source_config['selectors']['link'])
                            
                            if not title_elem or not link_elem:
                                continue
                            
                            title = clean_text(title_elem.get_text())
                            link = normalize_url(link_elem.get('href'), source_config['url'])
                            
                            # 跳过重复的新闻
                            if title in self.recent_titles:
                                continue
                            
                            # 检查标题是否与IC相关
                            if not is_valid_ic_content(title):
                                continue
                            
                            # 提取其他信息
                            summary_elem = element.select_one(source_config['selectors'].get('summary', ''))
                            date_elem = element.select_one(source_config['selectors'].get('date', ''))
                            
                            summary = clean_text(summary_elem.get_text()) if summary_elem else ''
                            date_str = clean_text(date_elem.get_text()) if date_elem else ''
                            
                            news_item = {
                                'title': title,
                                'summary': summary,
                                'original_url': link,
                                'source': source_config['name'],
                                'published_at': parse_date(date_str),
                                'category': categorize_news_content(title, summary),
                                'tags': [source_config['name'], 'HTML']
                            }
                            
                            # 尝试获取完整内容
                            full_content = await self.fetch_full_content(link, source_config)
                            if full_content:
                                news_item['content'] = full_content
                                if not summary:
                                    news_item['summary'] = extract_summary(full_content)
                            
                            news_items.append(news_item)
                            
                        except Exception as e:
                            logger.warning(f"Error parsing article element: {e}")
                            continue
                            
        except Exception as e:
            logger.error(f"Error scraping HTML source {source_config['url']}: {e}")
        
        return news_items

    async def fetch_full_content(self, url: str, source_config: Dict[str, Any]) -> Optional[str]:
        """获取文章完整内容"""
        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    content = await response.text()
                    soup = BeautifulSoup(content, 'html.parser')
                    
                    # 尝试使用配置的内容选择器
                    content_selector = source_config['selectors'].get('content')
                    if content_selector:
                        content_elem = soup.select_one(content_selector)
                        if content_elem:
                            return clean_text(content_elem.get_text())
                    
                    # 通用内容提取逻辑
                    content_selectors = [
                        '.article-content',
                        '.entry-content', 
                        '.post-content',
                        '.content',
                        'article',
                        '.article-body'
                    ]
                    
                    for selector in content_selectors:
                        content_elem = soup.select_one(selector)
                        if content_elem:
                            text = clean_text(content_elem.get_text())
                            if len(text) > 100:  # 确保内容足够长
                                return text
                    
        except Exception as e:
            logger.warning(f"Error fetching full content from {url}: {e}")
        
        return None

    async def save_news_item(self, news_item: Dict[str, Any]) -> bool:
        """保存新闻项"""
        try:
            if not validate_news_data(news_item):
                return False
            
            # 检查是否重复
            if news_item['title'] in self.recent_titles:
                return False
            
            # 保存到数据库
            news_id = await db.save_news(news_item)
            if news_id:
                self.recent_titles.append(news_item['title'])
                return True
            
        except Exception as e:
            logger.error(f"Error saving news item: {e}")
        
        return False

async def run_news_scraper():
    """运行新闻爬虫"""
    async with NewsScraper() as scraper:
        results = await scraper.scrape_all_sources()
        
        # 记录爬取结果
        total_items = sum(results.values())
        await db.save_crawl_log(
            'news_scraper', 
            'success', 
            f'Successfully scraped {total_items} news items',
            total_items
        )
        
        return results

if __name__ == "__main__":
    asyncio.run(run_news_scraper())