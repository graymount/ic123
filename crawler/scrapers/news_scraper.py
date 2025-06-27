import asyncio
import aiohttp
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
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
from utils.ai_summarizer import generate_news_summary

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
        """爬取RSS源"""
        news_items = []
        
        try:
            # 配置SSL验证选项
            connector = aiohttp.TCPConnector(ssl=False)
            async with aiohttp.ClientSession(
                connector=connector,
                timeout=aiohttp.ClientTimeout(total=30),
                headers={'User-Agent': USER_AGENT}
            ) as session:
                async with session.get(source_config['rss']) as response:
                    if response.status == 200:
                        content = await response.text()
                        
                        # 使用XML解析器解析RSS
                        try:
                            root = ET.fromstring(content)
                            
                            # 寻找RSS项目
                            items = root.findall('.//item') or root.findall('.//{http://purl.org/rss/1.0/}item')
                            
                            for item in items:
                                try:
                                    # 提取基本信息
                                    title_elem = item.find('title')
                                    link_elem = item.find('link')
                                    
                                    if title_elem is None or link_elem is None:
                                        continue
                                    
                                    title = clean_text(title_elem.text or '')
                                    link = link_elem.text or ''
                                    
                                    # 跳过重复的新闻
                                    if any(title.lower() in existing.lower() or existing.lower() in title.lower() 
                                           for existing in self.recent_titles):
                                        continue
                                    
                                    # 提取摘要
                                    summary = ""
                                    desc_elem = item.find('description') or item.find('summary')
                                    if desc_elem is not None and desc_elem.text:
                                        summary = clean_text(desc_elem.text)
                                    
                                    # 提取作者
                                    author = ""
                                    author_elem = item.find('author') or item.find('dc:creator', {'dc': 'http://purl.org/dc/elements/1.1/'})
                                    if author_elem is not None and author_elem.text:
                                        author = clean_text(author_elem.text)
                                    
                                    # 提取发布时间
                                    published_at = datetime.now(timezone.utc).isoformat()
                                    pubdate_elem = item.find('pubDate') or item.find('published')
                                    if pubdate_elem is not None and pubdate_elem.text:
                                        try:
                                            parsed_date = parse_date(pubdate_elem.text)
                                            if parsed_date:
                                                published_at = parsed_date
                                        except:
                                            pass
                                    
                                    # 验证IC相关内容
                                    content_text = f"{title} {summary}"
                                    if not is_valid_ic_content(content_text):
                                        continue
                                    
                                    news_item = {
                                        'title': title,
                                        'summary': summary,
                                        'content': summary,  # RSS通常只有摘要
                                        'source': source_config['name'],
                                        'author': author,
                                        'original_url': link,
                                        'published_at': published_at,
                                        'category': categorize_news_content(title, summary),
                                        'crawled_at': datetime.now(timezone.utc)
                                    }
                                    
                                    if validate_news_data(news_item):
                                        # 暂时跳过AI概要生成（数据库字段尚未创建）
                                        # await self.generate_ai_summary_for_item(news_item)
                                        news_items.append(news_item)
                                        
                                except Exception as e:
                                    logger.warning(f"Error parsing RSS entry: {e}")
                                    continue
                                    
                        except ET.ParseError as e:
                            logger.error(f"Error parsing RSS XML: {e}")
                            
        except Exception as e:
            logger.error(f"Error fetching RSS feed {source_config['rss']}: {e}")
            
        return news_items

    async def scrape_html_source(self, source_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """爬取HTML源"""
        news_items = []
        
        try:
            # 配置SSL验证选项
            connector = aiohttp.TCPConnector(ssl=False)  # 禁用SSL验证以解决证书问题
            async with aiohttp.ClientSession(
                connector=connector,
                timeout=aiohttp.ClientTimeout(total=30),
                headers={'User-Agent': USER_AGENT}
            ) as session:
                async with session.get(source_config['url']) as response:
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
                                
                                # 暂时跳过AI概要生成（数据库字段尚未创建）
                                # await self.generate_ai_summary_for_item(news_item)
                                
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
            # 使用与HTML抓取相同的SSL设置
            connector = aiohttp.TCPConnector(ssl=False)
            async with aiohttp.ClientSession(
                connector=connector,
                timeout=aiohttp.ClientTimeout(total=30),
                headers={'User-Agent': USER_AGENT}
            ) as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        content = await response.text()
                        soup = BeautifulSoup(content, 'html.parser')
                        
                        # 移除不需要的元素
                        for unwanted in soup(['script', 'style', 'nav', 'header', 'footer', 'aside', '.sidebar', '.advertisement', '.ads']):
                            unwanted.decompose()
                        
                        # 尝试使用配置的内容选择器
                        content_selector = source_config['selectors'].get('content')
                        if content_selector:
                            content_elem = soup.select_one(content_selector)
                            if content_elem:
                                text = clean_text(content_elem.get_text())
                                if len(text) > 200:
                                    return text
                        
                        # 增强的通用内容提取逻辑
                        content_selectors = [
                            # 具体的内容选择器
                            '.article-content',
                            '.entry-content', 
                            '.post-content',
                            '.content-area',
                            '.main-content',
                            '.article-body',
                            '.post-body',
                            '.content-wrapper',
                            # 语义化标签
                            'article',
                            'main article',
                            '.article',
                            '.post',
                            # 通用选择器
                            '.content',
                            '#content',
                            '[class*="content"]',
                            '[class*="article"]',
                            '[class*="post"]',
                            # 段落聚合
                            '.article-text',
                            '.text-content'
                        ]
                        
                        best_content = ""
                        max_length = 0
                        
                        for selector in content_selectors:
                            try:
                                content_elem = soup.select_one(selector)
                                if content_elem:
                                    text = clean_text(content_elem.get_text())
                                    if len(text) > max_length and len(text) > 200:
                                        max_length = len(text)
                                        best_content = text
                            except:
                                continue
                        
                        if best_content:
                            return best_content
                        
                        # 最后尝试：提取所有段落
                        paragraphs = soup.find_all('p')
                        if len(paragraphs) > 2:
                            full_text = '\n\n'.join([clean_text(p.get_text()) for p in paragraphs if len(clean_text(p.get_text())) > 50])
                            if len(full_text) > 200:
                                return full_text
                    
        except Exception as e:
            logger.warning(f"Error fetching full content from {url}: {e}")
        
        return None

    async def generate_ai_summary_for_item(self, news_item: Dict[str, Any]) -> None:
        """为新闻项生成AI概要"""
        try:
            # 检查是否有足够的内容进行AI处理
            content_for_ai = news_item.get('content') or news_item.get('summary') or news_item['title']
            
            if len(content_for_ai) < 50:  # 内容太短，跳过AI处理
                logger.info(f"Content too short for AI processing: {news_item['title']}")
                return
            
            # 生成AI概要
            ai_result = await generate_news_summary(
                title=news_item['title'],
                content=content_for_ai,
                source=news_item['source']
            )
            
            if ai_result:
                # 将AI概要添加到新闻项
                news_item['ai_summary'] = ai_result['summary']
                news_item['ai_keywords'] = ai_result.get('keywords', [])
                news_item['ai_processed'] = True
                news_item['ai_processed_at'] = datetime.now().isoformat()
                
                logger.success(f"Generated AI summary for: {news_item['title']}")
            else:
                # AI处理失败，标记为未处理
                news_item['ai_processed'] = False
                logger.warning(f"Failed to generate AI summary for: {news_item['title']}")
                
        except Exception as e:
            logger.error(f"Error generating AI summary for {news_item['title']}: {e}")
            news_item['ai_processed'] = False

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