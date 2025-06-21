import asyncio
import aiohttp
from datetime import datetime
from typing import List, Dict, Any
from loguru import logger

from utils.database import db
from utils.helpers import check_website_availability
from config.settings import USER_AGENT, CRAWL_DELAY

class WebsiteChecker:
    def __init__(self):
        self.session = None

    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': USER_AGENT}
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()

    async def check_all_websites(self) -> Dict[str, Any]:
        """检查所有网站的可用性"""
        logger.info("Starting website availability check")
        
        websites = await db.get_websites_for_check()
        logger.info(f"Found {len(websites)} websites to check")
        
        results = {
            'total_checked': len(websites),
            'available': 0,
            'unavailable': 0,
            'errors': []
        }
        
        for website in websites:
            try:
                logger.info(f"Checking website: {website['name']} - {website['url']}")
                
                check_result = await self.check_website(website)
                
                if check_result['available']:
                    results['available'] += 1
                    logger.success(f"✓ {website['name']} is available")
                else:
                    results['unavailable'] += 1
                    logger.warning(f"✗ {website['name']} is unavailable: {check_result['error_message']}")
                    results['errors'].append({
                        'website': website['name'],
                        'url': website['url'],
                        'error': check_result['error_message']
                    })
                
                # 更新数据库中的网站状态
                await db.update_website_status(
                    website['id'], 
                    check_result['available'],
                    check_result['error_message']
                )
                
                # 添加延迟以避免过于频繁的请求
                await asyncio.sleep(CRAWL_DELAY)
                
            except Exception as e:
                logger.error(f"Error checking website {website['name']}: {e}")
                results['errors'].append({
                    'website': website['name'],
                    'url': website['url'],
                    'error': str(e)
                })
        
        logger.info(f"Website check completed. Available: {results['available']}, Unavailable: {results['unavailable']}")
        return results

    async def check_website(self, website: Dict[str, Any]) -> Dict[str, Any]:
        """检查单个网站的可用性"""
        result = {
            'available': False,
            'status_code': None,
            'error_message': None,
            'response_time': None,
            'redirect_url': None
        }
        
        try:
            start_time = datetime.now()
            
            async with self.session.get(
                website['url'],
                allow_redirects=True,
                ssl=False  # 对于一些老网站可能需要
            ) as response:
                end_time = datetime.now()
                
                result['status_code'] = response.status
                result['response_time'] = (end_time - start_time).total_seconds()
                result['redirect_url'] = str(response.url) if response.url != website['url'] else None
                
                if response.status == 200:
                    # 检查响应内容
                    content = await response.text()
                    
                    # 基本的内容检查
                    if len(content) > 100:  # 确保不是空页面
                        result['available'] = True
                        logger.debug(f"Website {website['name']} returned valid content")
                    else:
                        result['error_message'] = '页面内容过短，可能是错误页面'
                        
                elif response.status == 301 or response.status == 302:
                    result['available'] = True
                    result['error_message'] = f'网站重定向到: {result["redirect_url"]}'
                    
                elif response.status == 403:
                    result['error_message'] = '访问被拒绝 (403 Forbidden)'
                    
                elif response.status == 404:
                    result['error_message'] = '页面不存在 (404 Not Found)'
                    
                elif response.status == 500:
                    result['error_message'] = '服务器内部错误 (500 Internal Server Error)'
                    
                else:
                    result['error_message'] = f'HTTP状态码: {response.status}'
                    
        except aiohttp.ClientError as e:
            result['error_message'] = f'连接错误: {str(e)}'
            
        except asyncio.TimeoutError:
            result['error_message'] = '请求超时'
            
        except Exception as e:
            result['error_message'] = f'未知错误: {str(e)}'
        
        return result

    async def check_specific_websites(self, website_ids: List[str]) -> Dict[str, Any]:
        """检查指定的网站"""
        logger.info(f"Checking specific websites: {website_ids}")
        
        results = {
            'total_checked': len(website_ids),
            'available': 0,
            'unavailable': 0,
            'errors': []
        }
        
        for website_id in website_ids:
            try:
                # 从数据库获取网站信息
                websites = await db.get_websites_for_check()
                website = next((w for w in websites if w['id'] == website_id), None)
                
                if not website:
                    logger.warning(f"Website with ID {website_id} not found")
                    continue
                
                check_result = await self.check_website(website)
                
                if check_result['available']:
                    results['available'] += 1
                else:
                    results['unavailable'] += 1
                    results['errors'].append({
                        'website': website['name'],
                        'url': website['url'],
                        'error': check_result['error_message']
                    })
                
                # 更新数据库状态
                await db.update_website_status(
                    website_id, 
                    check_result['available'],
                    check_result['error_message']
                )
                
            except Exception as e:
                logger.error(f"Error checking website {website_id}: {e}")
                results['errors'].append({
                    'website_id': website_id,
                    'error': str(e)
                })
        
        return results

async def run_website_checker():
    """运行网站检查器"""
    async with WebsiteChecker() as checker:
        results = await checker.check_all_websites()
        
        # 记录检查结果
        await db.save_crawl_log(
            'website_checker',
            'success',
            f'Checked {results["total_checked"]} websites. Available: {results["available"]}, Unavailable: {results["unavailable"]}',
            results['total_checked']
        )
        
        return results

if __name__ == "__main__":
    asyncio.run(run_website_checker())