#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新芯汇泽网站名称为芯汇泽（siliconice）
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
    
    def update_siliconice_name(self) -> bool:
        """更新芯汇泽网站名称"""
        try:
            # 首先查找芯汇泽网站（可能的名称）
            possible_names = ['芯汇泽', 'siliconice', '芯汇泽网站']
            website_id = None
            current_name = None
            
            for name in possible_names:
                params = {
                    'select': 'id,name',
                    'name': f'eq.{name}'
                }
                
                url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
                request = Request(url, headers=self.headers)
                
                with urlopen(request) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode('utf-8'))
                        if data:
                            website_id = data[0]['id']
                            current_name = data[0]['name']
                            logger.info(f"找到芯汇泽网站: {current_name}, ID: {website_id}")
                            break
            
            if not website_id:
                # 尝试通过URL查找
                params = {
                    'select': 'id,name,url',
                    'url': 'like.*huize.xin*'
                }
                
                url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
                request = Request(url, headers=self.headers)
                
                with urlopen(request) as response:
                    if response.status == 200:
                        data = json.loads(response.read().decode('utf-8'))
                        if data:
                            website_id = data[0]['id']
                            current_name = data[0]['name']
                            logger.info(f"通过URL找到网站: {current_name}, ID: {website_id}")
                        else:
                            logger.error("未找到芯汇泽网站")
                            return False
                    else:
                        logger.error(f"查询网站失败: {response.status}")
                        return False
            
            # 更新网站名称
            new_name = '芯汇泽（siliconice）'
            
            if current_name == new_name:
                logger.info(f"网站名称已经是正确格式: {new_name}")
                return True
            
            update_data = {'name': new_name}
            
            url = f"{self.supabase_url}/rest/v1/websites?id=eq.{website_id}"
            data = json.dumps(update_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            request.get_method = lambda: 'PATCH'
            
            with urlopen(request) as response:
                if response.status in [200, 204]:
                    logger.info(f"✅ 更新成功: {current_name} -> {new_name}")
                    return True
                else:
                    logger.error(f"❌ 更新失败: 状态码: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"更新网站名称失败: {str(e)}")
            return False

def main():
    """主函数"""
    logger.info("开始更新芯汇泽网站名称...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 更新芯汇泽网站名称
        if updater.update_siliconice_name():
            logger.info("✅ 芯汇泽网站名称更新完成!")
            logger.info("💡 网站名称已更新为'芯汇泽（siliconice）'")
            return True
        else:
            logger.error("❌ 芯汇泽网站名称更新失败")
            return False
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)