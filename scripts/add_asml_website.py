#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加ASML网站到网站导航
归类为设备材料
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
    
    def ensure_equipment_materials_category_exists(self) -> str:
        """确保设备材料分类存在，返回分类ID"""
        try:
            # 首先查询是否存在
            params = {
                'select': 'id,name',
                'name': 'eq.设备材料'
            }
            
            url = f"{self.supabase_url}/rest/v1/categories?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info(f"设备材料分类已存在，ID: {data[0]['id']}")
                        return data[0]['id']
            
            # 如果不存在，创建新分类
            logger.info("创建设备材料分类...")
            
            category_data = {
                'name': '设备材料',
                'description': '半导体制造设备和原材料供应商',
                'icon': 'cpu',
                'sort_order': 9,
                'is_active': True
            }
            
            url = f"{self.supabase_url}/rest/v1/categories"
            data = json.dumps(category_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            request.add_header('Prefer', 'return=representation')
            
            with urlopen(request) as response:
                if response.status in [200, 201]:
                    result = json.loads(response.read().decode('utf-8'))
                    category_id = result[0]['id']
                    logger.info(f"设备材料分类创建成功，ID: {category_id}")
                    return category_id
                else:
                    logger.error(f"创建分类失败: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"处理分类失败: {str(e)}")
            return None
    
    def add_asml_website(self, category_id: str) -> bool:
        """添加ASML网站"""
        try:
            # 检查是否已存在
            params = {
                'select': 'id,name',
                'name': 'eq.ASML'
            }
            
            url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info("ASML网站已存在，跳过添加")
                        return True
            
            # 添加网站
            logger.info("添加ASML网站...")
            
            website_data = {
                'name': 'ASML',
                'url': 'https://www.asml.com',
                'description': 'ASML是全球领先的光刻设备制造商，为半导体制造商提供先进的光刻系统、计量和检测解决方案，是半导体制造工艺链中的关键设备供应商。ASML的EUV和DUV光刻技术支撑着全球先进制程芯片的生产。',
                'category_id': category_id,
                'target_audience': 'IC制造商、晶圆厂、半导体设备工程师、工艺工程师、制程开发工程师、设备维护工程师',
                'use_case': '了解最新光刻技术、EUV设备信息、半导体制造设备采购、技术支持和服务、设备规格查询',
                'tags': ['光刻设备', 'EUV', '半导体制造', '工艺设备', 'DUV', '计量检测', 'ASML'],
                'is_active': True,
                'visit_count': 0,
                'rating': 4.8
            }
            
            url = f"{self.supabase_url}/rest/v1/websites"
            data = json.dumps(website_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status in [200, 201]:
                    logger.info("ASML网站添加成功!")
                    return True
                else:
                    logger.error(f"添加网站失败: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"添加网站失败: {str(e)}")
            return False

def main():
    """主函数"""
    logger.info("开始添加ASML网站到网站导航...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 确保设备材料分类存在
        category_id = updater.ensure_equipment_materials_category_exists()
        
        if not category_id:
            logger.error("无法创建或获取设备材料分类")
            return False
        
        # 添加网站
        if updater.add_asml_website(category_id):
            logger.info("✅ ASML网站添加完成!")
            logger.info("💡 现在可以在网站导航的'设备材料'分类中看到ASML了")
            return True
        else:
            logger.error("❌ ASML网站添加失败")
            return False
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)