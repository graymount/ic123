try:
    from supabase import create_client, Client
except ImportError:
    print("Please install supabase client: pip install supabase")
    exit(1)
from loguru import logger
from config.settings import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import hashlib
import asyncio

class DatabaseManager:
    def __init__(self):
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("Missing Supabase configuration")
        
        self.client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Database connection initialized")

    def _generate_content_hash(self, title: str, url: str = None) -> str:
        """生成内容哈希值用于去重"""
        content = title.lower().strip()
        if url:
            content += url.lower().strip()
        return hashlib.md5(content.encode('utf-8')).hexdigest()

    async def clean_duplicate_news(self) -> int:
        """清理重复的新闻数据"""
        try:
            logger.info("Starting duplicate news cleanup...")
            
            # 获取所有新闻，按创建时间排序
            result = self.client.table('news').select('id, title, original_url, created_at').order('created_at', desc=False).execute()
            all_news = result.data or []
            
            seen_hashes = set()
            duplicates_to_delete = []
            
            for news in all_news:
                content_hash = self._generate_content_hash(news['title'], news['original_url'])
                
                if content_hash in seen_hashes:
                    duplicates_to_delete.append(news['id'])
                    logger.info(f"Found duplicate: {news['title']}")
                else:
                    seen_hashes.add(content_hash)
            
            # 删除重复项
            deleted_count = 0
            for news_id in duplicates_to_delete:
                try:
                    delete_result = self.client.table('news').delete().eq('id', news_id).execute()
                    if delete_result.data:
                        deleted_count += 1
                except Exception as e:
                    logger.error(f"Error deleting duplicate news {news_id}: {e}")
            
            logger.success(f"Cleaned {deleted_count} duplicate news items")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning duplicate news: {e}")
            return 0

    async def clean_duplicate_websites(self) -> int:
        """清理重复的网站数据"""
        try:
            logger.info("Starting duplicate websites cleanup...")
            
            # 获取所有网站，按创建时间排序
            result = self.client.table('websites').select('id, name, url, created_at').order('created_at', desc=False).execute()
            all_websites = result.data or []
            
            seen_urls = set()
            duplicates_to_delete = []
            
            for website in all_websites:
                url_normalized = website['url'].lower().strip().rstrip('/')
                
                if url_normalized in seen_urls:
                    duplicates_to_delete.append(website['id'])
                    logger.info(f"Found duplicate website: {website['name']} - {website['url']}")
                else:
                    seen_urls.add(url_normalized)
            
            # 删除重复项
            deleted_count = 0
            for website_id in duplicates_to_delete:
                try:
                    delete_result = self.client.table('websites').delete().eq('id', website_id).execute()
                    if delete_result.data:
                        deleted_count += 1
                except Exception as e:
                    logger.error(f"Error deleting duplicate website {website_id}: {e}")
            
            logger.success(f"Cleaned {deleted_count} duplicate websites")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning duplicate websites: {e}")
            return 0

    async def save_news(self, news_data: Dict[str, Any]) -> Optional[str]:
        """保存新闻数据，增强去重逻辑"""
        try:
            # 标准化标题和URL
            title = news_data['title'].strip()
            url = news_data['original_url'].strip()
            
            # 检查是否已存在相同标题的新闻（精确匹配）
            existing_title = self.client.table('news').select('id').eq('title', title).execute()
            if existing_title.data:
                logger.info(f"News with same title already exists: {title}")
                return existing_title.data[0]['id']

            # 检查是否已存在相同URL的新闻
            existing_url = self.client.table('news').select('id').eq('original_url', url).execute()
            if existing_url.data:
                logger.info(f"News with same URL already exists: {url}")
                return existing_url.data[0]['id']

            # 检查内容相似度（使用哈希值）
            content_hash = self._generate_content_hash(title, url)
            
            # 检查最近7天是否有相似内容
            cutoff_date = (datetime.now() - timedelta(days=7)).isoformat()
            recent_news = self.client.table('news').select('title, original_url').gte('created_at', cutoff_date).execute()
            
            for existing in recent_news.data or []:
                existing_hash = self._generate_content_hash(existing['title'], existing['original_url'])
                if existing_hash == content_hash:
                    logger.info(f"Similar news content already exists: {title}")
                    return None

            # 添加创建时间
            news_data['created_at'] = datetime.now().isoformat()
            news_data['crawled_at'] = datetime.now().isoformat()

            # 临时移除AI字段（如果数据库表还没有这些字段）
            cleaned_data = news_data.copy()
            ai_fields = ['ai_summary', 'ai_processed', 'ai_keywords', 'ai_processed_at']
            for field in ai_fields:
                cleaned_data.pop(field, None)
            
            # 插入新闻
            result = self.client.table('news').insert(cleaned_data).execute()
            
            if result.data:
                news_id = result.data[0]['id']
                logger.success(f"News saved: {title}")
                return news_id
            else:
                logger.error(f"Failed to save news: {title}")
                return None
                
        except Exception as e:
            logger.error(f"Error saving news: {e}")
            return None

    async def save_website(self, website_data: Dict[str, Any]) -> Optional[str]:
        """保存网站数据，增强去重逻辑"""
        try:
            # 标准化URL
            url = website_data['url'].strip().rstrip('/')
            name = website_data['name'].strip()
            
            # 检查是否已存在相同URL的网站（标准化后比较）
            existing = self.client.table('websites').select('id, url').execute()
            for item in existing.data or []:
                if item['url'].strip().rstrip('/').lower() == url.lower():
                    logger.info(f"Website with same URL already exists: {url}")
                    return item['id']

            # 检查是否已存在相同名称的网站
            existing_name = self.client.table('websites').select('id').ilike('name', f'%{name}%').execute()
            if existing_name.data:
                logger.info(f"Website with similar name already exists: {name}")
                return existing_name.data[0]['id']

            # 添加创建时间
            website_data['created_at'] = datetime.now().isoformat()

            # 插入网站
            result = self.client.table('websites').insert(website_data).execute()
            
            if result.data:
                website_id = result.data[0]['id']
                logger.success(f"Website saved: {name}")
                return website_id
            else:
                logger.error(f"Failed to save website: {name}")
                return None
                
        except Exception as e:
            logger.error(f"Error saving website: {e}")
            return None

    async def get_categories(self) -> List[Dict[str, Any]]:
        """获取所有分类"""
        try:
            result = self.client.table('categories').select('*').eq('is_active', True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            return []

    async def get_category_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """根据名称获取分类"""
        try:
            result = self.client.table('categories').select('*').eq('name', name).single().execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting category by name {name}: {e}")
            return None

    async def update_website_status(self, website_id: str, is_active: bool, error_message: str = None) -> bool:
        """更新网站状态"""
        try:
            update_data = {'is_active': is_active, 'updated_at': datetime.now().isoformat()}
            if error_message:
                update_data['admin_notes'] = error_message
                
            result = self.client.table('websites').update(update_data).eq('id', website_id).execute()
            return bool(result.data)
        except Exception as e:
            logger.error(f"Error updating website status: {e}")
            return False

    async def get_recent_news_titles(self, days: int = 7) -> List[str]:
        """获取最近几天的新闻标题，用于去重"""
        try:
            cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
            
            result = self.client.table('news').select('title').gte('created_at', cutoff_date).execute()
            return [item['title'] for item in result.data or []]
        except Exception as e:
            logger.error(f"Error getting recent news titles: {e}")
            return []

    async def get_websites_for_check(self) -> List[Dict[str, Any]]:
        """获取需要检查的网站列表"""
        try:
            result = self.client.table('websites').select('id, name, url').eq('is_active', True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting websites for check: {e}")
            return []

    async def get_database_stats(self) -> Dict[str, int]:
        """获取数据库统计信息"""
        try:
            stats = {}
            
            # 获取各表的记录数
            for table in ['categories', 'websites', 'news', 'wechat_accounts', 'user_feedback']:
                try:
                    result = self.client.table(table).select('id', count='exact').execute()
                    stats[table] = result.count or 0
                except:
                    stats[table] = 0
            
            return stats
        except Exception as e:
            logger.error(f"Error getting database stats: {e}")
            return {}

    async def save_crawl_log(self, source: str, status: str, message: str, items_count: int = 0):
        """保存爬取日志"""
        try:
            log_data = {
                'source': source,
                'status': status,
                'message': message,
                'items_count': items_count,
                'crawled_at': datetime.now().isoformat()
            }
            
            # 如果没有crawl_logs表，可以先创建或使用其他方式记录
            logger.info(f"Crawl log: {source} - {status} - {message} ({items_count} items)")
            
        except Exception as e:
            logger.error(f"Error saving crawl log: {e}")

    async def delete_website(self, website_id: str) -> bool:
        """删除指定的网站"""
        try:
            result = self.client.table('websites').delete().eq('id', website_id).execute()
            if result.data:
                logger.success(f"Website deleted successfully: {website_id}")
                return True
            else:
                logger.warning(f"Website not found or already deleted: {website_id}")
                return False
        except Exception as e:
            logger.error(f"Error deleting website {website_id}: {e}")
            return False

    async def delete_inactive_websites(self) -> int:
        """删除不可用的网站"""
        try:
            logger.info("Starting inactive websites cleanup...")
            
            # 获取所有网站进行状态检查
            websites = await self.get_websites_for_check()
            deleted_count = 0
            
            # 预定义的不可用网站列表（基于之前的检查结果）
            inactive_websites = [
                {"id": "ec58c217-0e35-4116-b86b-a70ae3024e3c", "name": "芯思想", "url": "https://www.xinsiwei.com/"},
                {"id": "dc0df887-2715-4d35-be1e-f3e7554337e7", "name": "芯片人才网", "url": "https://www.icjob.com/"}
            ]
            
            for website in inactive_websites:
                try:
                    logger.info(f"Deleting inactive website: {website['name']} - {website['url']}")
                    if await self.delete_website(website['id']):
                        deleted_count += 1
                except Exception as e:
                    logger.error(f"Error deleting website {website['name']}: {e}")
            
            logger.success(f"Deleted {deleted_count} inactive websites")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning inactive websites: {e}")
            return 0

    async def save_wechat_account(self, wechat_data: Dict[str, Any]) -> Optional[str]:
        """保存微信公众号数据"""
        try:
            # 标准化数据
            name = wechat_data['name'].strip()
            wechat_id = wechat_data.get('wechat_id', '').strip()
            
            # 检查是否已存在相同名称的公众号
            existing_name = self.client.table('wechat_accounts').select('id').eq('name', name).execute()
            if existing_name.data:
                logger.info(f"WeChat account with same name already exists: {name}")
                return existing_name.data[0]['id']

            # 检查是否已存在相同微信号的公众号
            if wechat_id:
                existing_id = self.client.table('wechat_accounts').select('id').eq('wechat_id', wechat_id).execute()
                if existing_id.data:
                    logger.info(f"WeChat account with same wechat_id already exists: {wechat_id}")
                    return existing_id.data[0]['id']

            # 添加创建时间
            wechat_data['created_at'] = datetime.now().isoformat()
            wechat_data['updated_at'] = datetime.now().isoformat()

            # 插入微信公众号
            result = self.client.table('wechat_accounts').insert(wechat_data).execute()
            
            if result.data:
                account_id = result.data[0]['id']
                logger.success(f"WeChat account saved: {name}")
                return account_id
            else:
                logger.error(f"Failed to save WeChat account: {name}")
                return None
                
        except Exception as e:
            logger.error(f"Error saving WeChat account: {e}")
            return None

    async def check_wechat_exists(self, name: str, wechat_id: str = None) -> bool:
        """检查微信公众号是否已存在"""
        try:
            # 检查名称
            existing_name = self.client.table('wechat_accounts').select('id').eq('name', name).execute()
            if existing_name.data:
                return True
            
            # 检查微信号
            if wechat_id:
                existing_id = self.client.table('wechat_accounts').select('id').eq('wechat_id', wechat_id).execute()
                if existing_id.data:
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Error checking WeChat account existence: {e}")
            return False

    async def get_wechat_accounts(self, limit: int = 50) -> List[Dict[str, Any]]:
        """获取微信公众号列表"""
        try:
            result = self.client.table('wechat_accounts').select('*').limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting WeChat accounts: {e}")
            return []

    async def update_news_ai_summary(self, news_id: str, ai_summary: str, ai_keywords: List[str] = None) -> bool:
        """更新新闻的AI概要"""
        try:
            update_data = {
                'ai_summary': ai_summary,
                'ai_processed': True,
                'ai_processed_at': datetime.now().isoformat()
            }
            
            if ai_keywords:
                update_data['ai_keywords'] = ai_keywords
            
            result = self.client.table('news').update(update_data).eq('id', news_id).execute()
            
            if result.data:
                logger.success(f"AI summary updated for news ID: {news_id}")
                return True
            else:
                logger.error(f"Failed to update AI summary for news ID: {news_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error updating AI summary: {e}")
            return False

    async def get_news_without_ai_summary(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取未生成AI概要的新闻"""
        try:
            result = self.client.table('news').select('id, title, summary, content, source').eq('ai_processed', False).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting news without AI summary: {e}")
            return []

    async def batch_process_ai_summaries(self, batch_size: int = 5) -> int:
        """批量处理AI概要生成"""
        try:
            # 获取未处理的新闻
            news_items = await self.get_news_without_ai_summary(batch_size)
            if not news_items:
                logger.info("No news items need AI summary processing")
                return 0
            
            from utils.ai_summarizer import generate_news_summary
            
            processed_count = 0
            for news in news_items:
                try:
                    # 生成AI概要
                    content_for_ai = news.get('content') or news.get('summary') or news['title']
                    ai_result = await generate_news_summary(
                        title=news['title'],
                        content=content_for_ai,
                        source=news['source']
                    )
                    
                    if ai_result:
                        # 更新数据库
                        success = await self.update_news_ai_summary(
                            news_id=news['id'],
                            ai_summary=ai_result['summary'],
                            ai_keywords=ai_result.get('keywords', [])
                        )
                        
                        if success:
                            processed_count += 1
                            logger.info(f"Generated AI summary for: {news['title']}")
                        
                        # 添加延迟避免API限制
                        await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error processing AI summary for news {news['id']}: {e}")
                    continue
            
            logger.success(f"Processed AI summaries for {processed_count} news items")
            return processed_count
            
        except Exception as e:
            logger.error(f"Error in batch AI summary processing: {e}")
            return 0

    async def clean_duplicate_wechat_accounts(self) -> int:
        """清理重复的微信公众号数据"""
        try:
            logger.info("Starting duplicate WeChat accounts cleanup...")
            
            # 获取所有微信公众号，按创建时间排序
            result = self.client.table('wechat_accounts').select('id, name, wechat_id, created_at').order('created_at', desc=False).execute()
            all_accounts = result.data or []
            
            seen_names = set()
            seen_wechat_ids = set()
            duplicates_to_delete = []
            
            for account in all_accounts:
                name = account['name'].lower().strip()
                wechat_id = account.get('wechat_id', '').lower().strip()
                
                is_duplicate = False
                
                # 检查名称重复
                if name in seen_names:
                    is_duplicate = True
                    logger.info(f"Found duplicate WeChat account by name: {account['name']}")
                
                # 检查微信号重复
                if wechat_id and wechat_id in seen_wechat_ids:
                    is_duplicate = True
                    logger.info(f"Found duplicate WeChat account by wechat_id: {account['name']} ({wechat_id})")
                
                if is_duplicate:
                    duplicates_to_delete.append(account['id'])
                else:
                    seen_names.add(name)
                    if wechat_id:
                        seen_wechat_ids.add(wechat_id)
            
            # 删除重复项
            deleted_count = 0
            for account_id in duplicates_to_delete:
                try:
                    delete_result = self.client.table('wechat_accounts').delete().eq('id', account_id).execute()
                    if delete_result.data:
                        deleted_count += 1
                except Exception as e:
                    logger.error(f"Error deleting duplicate WeChat account {account_id}: {e}")
            
            logger.success(f"Cleaned {deleted_count} duplicate WeChat accounts")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Error cleaning duplicate WeChat accounts: {e}")
            return 0

db = DatabaseManager()