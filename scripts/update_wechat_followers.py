#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
新榜公众号数据抓取脚本
从新榜网站抓取公众号粉丝数和其他数据，然后更新到Supabase数据库
"""

import os
import sys
import time
import random
import requests
import logging
from typing import Dict, List, Optional
from urllib.parse import quote
import json
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/wechat_crawler.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class NewRankCrawler:
    """新榜数据爬虫类"""
    
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://www.newrank.cn"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://www.newrank.cn/',
        }
        self.session.headers.update(self.headers)
        
    def search_account(self, account_name: str) -> Optional[Dict]:
        """搜索公众号"""
        try:
            search_url = f"{self.base_url}/xdnphb/search/wechat"
            params = {
                'keyword': account_name,
                'flag': 'wechat'
            }
            
            logger.info(f"搜索公众号: {account_name}")
            response = self.session.get(search_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and data.get('data'):
                    # 取第一个匹配结果
                    accounts = data['data']
                    if accounts:
                        return accounts[0]
            
            # 添加随机延迟避免被封
            time.sleep(random.uniform(1, 3))
            return None
            
        except Exception as e:
            logger.error(f"搜索公众号 {account_name} 失败: {str(e)}")
            return None
    
    def get_account_detail(self, account_id: str) -> Optional[Dict]:
        """获取公众号详细信息"""
        try:
            detail_url = f"{self.base_url}/xdnphb/detail/getAccountInfo"
            params = {
                'account': account_id
            }
            
            response = self.session.get(detail_url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data.get('data', {})
            
            time.sleep(random.uniform(1, 3))
            return None
            
        except Exception as e:
            logger.error(f"获取公众号详情失败: {str(e)}")
            return None

class SupabaseUpdater:
    """Supabase数据库更新类"""
    
    def __init__(self):
        # 从环境变量获取Supabase配置
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_ANON_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("请设置 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量")
        
        self.headers = {
            'apikey': self.supabase_key,
            'Authorization': f'Bearer {self.supabase_key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    
    def get_all_wechat_accounts(self) -> List[Dict]:
        """获取所有微信公众号"""
        try:
            url = f"{self.supabase_url}/rest/v1/wechat_accounts"
            params = {
                'select': 'id,name,wechat_id,follower_count',
                'is_active': 'eq.true'
            }
            
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"获取公众号列表失败: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"数据库查询失败: {str(e)}")
            return []
    
    def update_follower_count(self, account_id: str, follower_count: int, 
                            wechat_id: str = None) -> bool:
        """更新公众号粉丝数"""
        try:
            url = f"{self.supabase_url}/rest/v1/wechat_accounts"
            
            update_data = {
                'follower_count': follower_count,
                'updated_at': datetime.now().isoformat()
            }
            
            if wechat_id:
                update_data['wechat_id'] = wechat_id
            
            params = {'id': f'eq.{account_id}'}
            
            response = requests.patch(
                url, 
                headers=self.headers, 
                params=params,
                json=update_data
            )
            
            if response.status_code in [200, 204]:
                logger.info(f"更新成功: {account_id}")
                return True
            else:
                logger.error(f"更新失败: {response.status_code}, {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"更新数据库失败: {str(e)}")
            return False

def main():
    """主函数"""
    logger.info("开始更新微信公众号数据...")
    
    # 创建爬虫和数据库更新器
    crawler = NewRankCrawler()
    updater = SupabaseUpdater()
    
    # 获取所有需要更新的公众号
    accounts = updater.get_all_wechat_accounts()
    
    if not accounts:
        logger.warning("没有找到需要更新的公众号")
        return
    
    logger.info(f"找到 {len(accounts)} 个公众号需要更新")
    
    success_count = 0
    fail_count = 0
    
    for account in accounts:
        try:
            account_id = account['id']
            account_name = account['name']
            current_followers = account.get('follower_count', 0)
            
            logger.info(f"处理公众号: {account_name} (当前粉丝数: {current_followers})")
            
            # 搜索公众号
            search_result = crawler.search_account(account_name)
            
            if search_result:
                # 获取详细信息
                detail = crawler.get_account_detail(search_result.get('account'))
                
                if detail:
                    new_followers = detail.get('fans_num', 0)
                    wechat_id = detail.get('wechat_id')
                    
                    if new_followers > 0:
                        # 更新数据库
                        if updater.update_follower_count(account_id, new_followers, wechat_id):
                            success_count += 1
                            logger.info(f"✅ {account_name}: {current_followers} → {new_followers}")
                        else:
                            fail_count += 1
                    else:
                        logger.warning(f"⚠️  {account_name}: 未获取到有效粉丝数")
                        fail_count += 1
                else:
                    logger.warning(f"⚠️  {account_name}: 获取详情失败")
                    fail_count += 1
            else:
                logger.warning(f"⚠️  {account_name}: 搜索失败")
                fail_count += 1
            
            # 随机延迟，避免被封
            time.sleep(random.uniform(2, 5))
            
        except Exception as e:
            logger.error(f"处理公众号 {account.get('name', 'Unknown')} 时出错: {str(e)}")
            fail_count += 1
    
    logger.info(f"更新完成! 成功: {success_count}, 失败: {fail_count}")

if __name__ == "__main__":
    # 创建日志目录
    os.makedirs('logs', exist_ok=True)
    
    try:
        main()
    except KeyboardInterrupt:
        logger.info("用户中断程序")
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        sys.exit(1) 