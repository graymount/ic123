#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加西门子EDA网站到设计工具分类
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
    
    def get_design_tools_category_id(self) -> str:
        """获取设计工具分类ID"""
        try:
            # 查询设计工具分类
            params = {
                'select': 'id,name',
                'name': 'eq.设计工具'
            }
            
            url = f"{self.supabase_url}/rest/v1/categories?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info(f"设计工具分类存在，ID: {data[0]['id']}")
                        return data[0]['id']
                    else:
                        logger.error("设计工具分类不存在")
                        return None
                else:
                    logger.error(f"查询分类失败: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"获取分类ID失败: {str(e)}")
            return None
    
    def website_exists(self, name: str) -> bool:
        """检查网站是否已存在"""
        try:
            params = {
                'select': 'id,name',
                'name': f'eq.{name}'
            }
            
            url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    return len(data) > 0
                else:
                    return False
                    
        except Exception as e:
            logger.error(f"检查网站存在性失败: {str(e)}")
            return False
    
    def add_siemens_eda(self, category_id: str) -> bool:
        """添加西门子EDA网站"""
        try:
            website_name = "西门子EDA - Siemens EDA"
            
            # 检查是否已存在
            if self.website_exists(website_name):
                logger.info(f"{website_name} 已存在，跳过添加")
                return True
            
            # 添加网站
            logger.info(f"添加网站: {website_name}")
            
            website_data = {
                'name': website_name,
                'url': 'https://eda.sw.siemens.com/',
                'description': '西门子EDA（原Mentor Graphics）是全球领先的电子设计自动化软件供应商，提供完整的IC设计、验证、测试和制造解决方案。涵盖模拟IC设计、数字设计、系统级设计、DFT、物理验证等全流程EDA工具链，服务于汽车、航空航天、通信等关键行业。',
                'category_id': category_id,
                'target_audience': 'IC设计工程师、模拟工程师、数字工程师、验证工程师、DFT工程师、系统工程师',
                'use_case': 'IC设计、电路仿真、版图设计、逻辑综合、时序分析、DFT插入、物理验证、系统级设计',
                'tags': ['西门子EDA', 'Siemens EDA', 'Mentor Graphics', 'IC设计工具', 'EDA软件', '电路仿真', '版图设计', 'DFT'],
                'is_active': True,
                'visit_count': 0,
                'rating': 4.7
            }
            
            url = f"{self.supabase_url}/rest/v1/websites"
            data = json.dumps(website_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status in [200, 201]:
                    logger.info(f"✅ {website_name} 添加成功!")
                    return True
                else:
                    logger.error(f"❌ 添加 {website_name} 失败: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"添加网站失败: {str(e)}")
            return False

def main():
    """主函数"""
    logger.info("开始添加西门子EDA网站...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 获取设计工具分类ID
        category_id = updater.get_design_tools_category_id()
        
        if not category_id:
            logger.error("无法获取设计工具分类ID")
            return False
        
        # 添加西门子EDA网站
        if updater.add_siemens_eda(category_id):
            logger.info("✅ 西门子EDA网站添加完成!")
            logger.info("💡 现在可以在网站导航的'设计工具'分类中看到西门子EDA了")
            return True
        else:
            logger.error("❌ 西门子EDA网站添加失败")
            return False
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)