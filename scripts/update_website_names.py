#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新行业门户网站名称格式
统一为"英文缩写 - 中文/英文全称"格式
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
    
    def update_website_name(self, old_name: str, new_name: str) -> bool:
        """更新网站名称"""
        try:
            # 首先查找网站
            params = {
                'select': 'id,name',
                'name': f'eq.{old_name}'
            }
            
            url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if not data:
                        logger.warning(f"未找到网站: {old_name}")
                        return False
                    
                    website_id = data[0]['id']
                    logger.info(f"找到网站: {old_name}, ID: {website_id}")
                else:
                    logger.error(f"查询网站失败: {response.status}")
                    return False
            
            # 更新网站名称
            update_data = {'name': new_name}
            
            url = f"{self.supabase_url}/rest/v1/websites?id=eq.{website_id}"
            data = json.dumps(update_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            request.get_method = lambda: 'PATCH'
            
            with urlopen(request) as response:
                if response.status in [200, 204]:
                    logger.info(f"✅ 更新成功: {old_name} -> {new_name}")
                    return True
                else:
                    logger.error(f"❌ 更新失败: {old_name}, 状态码: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"更新网站名称失败: {str(e)}")
            return False

def get_name_updates():
    """获取需要更新的网站名称映射"""
    updates = [
        {
            'old_name': 'SIA - 美国半导体行业协会',
            'new_name': '美国半导体行业协会 - SIA'
        },
        {
            'old_name': 'SEMI - 全球半导体设备材料产业协会',
            'new_name': '全球半导体设备材料产业协会 - SEMI'
        },
        {
            'old_name': 'GSA - 全球半导体联盟',
            'new_name': '全球半导体联盟 - GSA'
        },
        {
            'old_name': 'ESIA - 欧洲半导体工业协会',
            'new_name': '欧洲半导体工业协会 - ESIA'
        },
        {
            'old_name': 'CSIA - 中国半导体行业协会',
            'new_name': '中国半导体行业协会 - CSIA'
        },
        {
            'old_name': 'Semiconductor Digest - 半导体行业媒体',
            'new_name': '半导体行业媒体 - Semiconductor Digest'
        },
        {
            'old_name': 'Stratview Research - 半导体市场研究',
            'new_name': '半导体市场研究 - Stratview Research'
        },
        {
            'old_name': 'NSTC - 美国国家半导体技术中心',
            'new_name': '美国国家半导体技术中心 - NSTC'
        }
    ]
    
    return updates

def main():
    """主函数"""
    logger.info("开始更新网站名称格式...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 获取更新列表
        updates = get_name_updates()
        
        # 批量更新网站名称
        success_count = 0
        total_count = len(updates)
        
        for update in updates:
            old_name = update['old_name']
            new_name = update['new_name']
            
            # 如果名称相同，跳过更新
            if old_name == new_name:
                logger.info(f"⏭️  跳过 {old_name} (名称已是正确格式)")
                success_count += 1
                continue
            
            if updater.update_website_name(old_name, new_name):
                success_count += 1
        
        logger.info(f"✅ 名称格式更新完成! 成功: {success_count}/{total_count}")
        logger.info("💡 所有网站名称已统一为'中文全称 - 英文缩写'格式")
        
        return success_count == total_count
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)