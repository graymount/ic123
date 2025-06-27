#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加ic技术圈到网站导航
归类为技术社区
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
    
    def ensure_category_exists(self) -> str:
        """确保技术社区分类存在，返回分类ID"""
        try:
            # 首先查询是否存在
            params = {
                'select': 'id,name',
                'name': 'eq.技术社区'
            }
            
            url = f"{self.supabase_url}/rest/v1/categories?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info(f"技术社区分类已存在，ID: {data[0]['id']}")
                        return data[0]['id']
            
            # 如果不存在，创建新分类
            logger.info("创建技术社区分类...")
            
            category_data = {
                'name': '技术社区',
                'description': 'IC行业技术交流和讨论社区',
                'icon': '👥',
                'sort_order': 8,
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
                    logger.info(f"技术社区分类创建成功，ID: {category_id}")
                    return category_id
                else:
                    logger.error(f"创建分类失败: {response.status}")
                    return None
                    
        except Exception as e:
            logger.error(f"处理分类失败: {str(e)}")
            return None
    
    def add_ic_tech_community(self, category_id: str) -> bool:
        """添加ic技术圈网站"""
        try:
            # 检查是否已存在
            params = {
                'select': 'id,name',
                'name': 'eq.ic技术圈'
            }
            
            url = f"{self.supabase_url}/rest/v1/websites?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info("ic技术圈已存在，跳过添加")
                        return True
            
            # 添加网站
            logger.info("添加ic技术圈网站...")
            
            website_data = {
                'name': 'ic技术圈',
                'url': 'https://www.iccircle.com/',
                'description': '专业的集成电路技术交流社区，汇聚IC行业工程师、研发人员和技术专家。提供技术讨论、经验分享、问题求助、职业发展等服务。涵盖模拟IC设计、数字IC设计、版图设计、验证、工艺、封装测试等各个技术领域，是IC从业者学习交流的重要平台。',
                'category_id': category_id,
                'target_audience': 'IC设计工程师、模拟工程师、数字工程师、版图工程师、验证工程师、工艺工程师、封测工程师、IC技术爱好者',
                'use_case': '技术讨论、经验分享、问题求助、技术资料下载、职业发展咨询、行业交流',
                'tags': ['IC技术圈', '技术社区', '技术交流', 'IC设计', '工程师社区', '技术讨论', '经验分享'],
                'is_active': True,
                'visit_count': 0,
                'rating': 4.5
            }
            
            url = f"{self.supabase_url}/rest/v1/websites"
            data = json.dumps(website_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status in [200, 201]:
                    logger.info("ic技术圈添加成功!")
                    return True
                else:
                    logger.error(f"添加网站失败: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"添加网站失败: {str(e)}")
            return False

def main():
    """主函数"""
    logger.info("开始添加ic技术圈到网站导航...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 确保分类存在
        category_id = updater.ensure_category_exists()
        
        if not category_id:
            logger.error("无法创建或获取技术社区分类")
            return False
        
        # 添加网站
        if updater.add_ic_tech_community(category_id):
            logger.info("✅ ic技术圈添加完成!")
            logger.info("💡 现在可以在网站导航的'技术社区'分类中看到ic技术圈了")
            return True
        else:
            logger.error("❌ ic技术圈添加失败")
            return False
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 