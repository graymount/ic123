#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
微信公众号数据测试更新脚本
手动设置一些公众号的粉丝数据用于测试
"""

import os
import sys
import json
import logging
from datetime import datetime
from typing import Dict, List
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import URLError, HTTPError

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

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
            params = {
                'select': 'id,name,wechat_id,follower_count',
                'is_active': 'eq.true'
            }
            
            url = f"{self.supabase_url}/rest/v1/wechat_accounts?{urlencode(params)}"
            
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                logger.info(f"获取公众号列表: {response.status}")
                
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    logger.info(f"获取到 {len(data)} 个公众号")
                    return data
                else:
                    logger.error(f"获取公众号列表失败: {response.status}")
                    return []
                
        except Exception as e:
            logger.error(f"数据库查询失败: {str(e)}")
            return []
    
    def update_follower_count(self, account_id: str, follower_count: int) -> bool:
        """更新公众号粉丝数"""
        try:
            params = {'id': f'eq.{account_id}'}
            url = f"{self.supabase_url}/rest/v1/wechat_accounts?{urlencode(params)}"
            
            update_data = {
                'follower_count': follower_count,
                'updated_at': datetime.now().isoformat()
            }
            
            data = json.dumps(update_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            request.get_method = lambda: 'PATCH'
            
            with urlopen(request) as response:
                if response.status in [200, 204]:
                    logger.info(f"更新成功: {account_id} -> {follower_count}")
                    return True
                else:
                    logger.error(f"更新失败: {response.status}")
                    return False
                
        except Exception as e:
            logger.error(f"更新数据库失败: {str(e)}")
            return False

# 模拟的公众号粉丝数据
MOCK_FOLLOWER_DATA = {
    "芯片大师": 85000,
    "IC人才网": 52000,
    "芯片设计工程师": 78000,
    "EDA技术分享": 43000,
    "数字IC设计": 65000,
    "IC设计与验证": 71000,
    "芯师爷": 120000,
    "芯东西": 180000,
    "半导体行业观察": 95000,
    "芯榜": 68000
}

def main():
    """主函数"""
    logger.info("开始测试更新微信公众号数据...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 获取所有公众号
        accounts = updater.get_all_wechat_accounts()
        
        if not accounts:
            logger.warning("没有找到需要更新的公众号")
            return
        
        logger.info(f"找到 {len(accounts)} 个公众号")
        
        success_count = 0
        
        for account in accounts:
            account_id = account['id']
            account_name = account['name']
            current_followers = account.get('follower_count', 0)
            
            # 查找是否有模拟数据
            if account_name in MOCK_FOLLOWER_DATA:
                new_followers = MOCK_FOLLOWER_DATA[account_name]
                
                if updater.update_follower_count(account_id, new_followers):
                    success_count += 1
                    logger.info(f"✅ {account_name}: {current_followers} → {new_followers}")
                else:
                    logger.error(f"❌ {account_name}: 更新失败")
            else:
                # 如果没有模拟数据，设置一个随机数
                import random
                new_followers = random.randint(10000, 150000)
                
                if updater.update_follower_count(account_id, new_followers):
                    success_count += 1
                    logger.info(f"✅ {account_name}: {current_followers} → {new_followers} (随机数)")
        
        logger.info(f"更新完成! 成功更新 {success_count} 个公众号")
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 