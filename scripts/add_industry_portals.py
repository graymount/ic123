#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量添加半导体行业门户网站到网站导航
归类为行业门户
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
    
    def get_industry_portal_category_id(self) -> str:
        """获取行业门户分类ID"""
        try:
            # 查询行业门户分类
            params = {
                'select': 'id,name',
                'name': 'eq.行业门户'
            }
            
            url = f"{self.supabase_url}/rest/v1/categories?{urlencode(params)}"
            request = Request(url, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode('utf-8'))
                    if data:
                        logger.info(f"行业门户分类存在，ID: {data[0]['id']}")
                        return data[0]['id']
                    else:
                        logger.error("行业门户分类不存在")
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
    
    def add_website(self, website_data: dict, category_id: str) -> bool:
        """添加网站"""
        try:
            # 检查是否已存在
            if self.website_exists(website_data['name']):
                logger.info(f"{website_data['name']} 已存在，跳过添加")
                return True
            
            # 添加网站
            logger.info(f"添加网站: {website_data['name']}")
            
            website_data['category_id'] = category_id
            website_data['is_active'] = True
            website_data['visit_count'] = 0
            
            url = f"{self.supabase_url}/rest/v1/websites"
            data = json.dumps(website_data).encode('utf-8')
            
            request = Request(url, data=data, headers=self.headers)
            
            with urlopen(request) as response:
                if response.status in [200, 201]:
                    logger.info(f"✅ {website_data['name']} 添加成功!")
                    return True
                else:
                    logger.error(f"❌ 添加 {website_data['name']} 失败: {response.status}")
                    return False
                    
        except Exception as e:
            logger.error(f"添加网站失败: {str(e)}")
            return False

def get_industry_portal_websites():
    """获取行业门户网站列表"""
    websites = [
        {
            'name': 'SIA - Semiconductor Industry Association',
            'url': 'https://www.semiconductors.org/',
            'description': '美国半导体行业协会(SIA)是美国半导体产业的权威代表机构，成立于1977年。致力于推动半导体技术创新、政策倡导和国际贸易，代表美国半导体产业参与全球政策制定，发布权威的市场数据和行业报告。',
            'target_audience': '半导体企业高管、政策制定者、投资机构、行业分析师、媒体记者',
            'use_case': '获取美国半导体政策信息、行业统计数据、政府关系、贸易政策、技术标准制定',
            'tags': ['SIA', '美国半导体协会', '行业政策', '市场数据', '政府关系', '贸易政策'],
            'rating': 4.7
        },
        {
            'name': 'SEMI - 全球半导体设备材料产业协会',
            'url': 'https://www.semi.org/',
            'description': 'SEMI是全球半导体设备和材料产业的国际行业协会，成立于1970年。服务于半导体制造供应链，提供市场研究、行业标准制定、展会活动和产业发展支持，是连接全球半导体生态系统的重要平台。',
            'target_audience': '半导体设备制造商、材料供应商、晶圆厂、工艺工程师、市场分析师',
            'use_case': '了解设备材料市场趋势、参与行业标准制定、参加SEMICON展会、获取供应链信息',
            'tags': ['SEMI', '半导体设备', '材料供应', '行业标准', 'SEMICON', '市场研究'],
            'rating': 4.8
        },
        {
            'name': 'GSA - Global Semiconductor Alliance',
            'url': 'https://www.gsaglobal.org/',
            'description': '全球半导体联盟(GSA)成立于1994年，是专注于半导体产业发展的国际组织。通过会员服务、市场研究、产业报告和网络活动，促进全球半导体生态系统的合作与发展，特别关注新兴技术和市场机遇。',
            'target_audience': '半导体初创企业、投资机构、产业高管、技术专家、商业开发人员',
            'use_case': '产业网络建设、市场情报获取、投资机会发现、技术趋势分析、商业合作对接',
            'tags': ['GSA', '全球半导体联盟', '产业网络', '市场情报', '投资分析', '商业合作'],
            'rating': 4.5
        },
        {
            'name': 'ESIA - European Semiconductor Industry Association',
            'url': 'https://www.eusemiconductors.eu/esia',
            'description': '欧洲半导体工业协会(ESIA)是代表欧洲半导体产业利益的权威机构。致力于推动欧洲半导体技术创新、政策制定和国际合作，促进欧洲在全球半导体价值链中的竞争力提升。',
            'target_audience': '欧洲半导体企业、政策制定者、研究机构、投资机构、媒体',
            'use_case': '了解欧盟半导体政策、参与欧洲产业合作、获取市场分析报告、政策倡导支持',
            'tags': ['ESIA', '欧洲半导体协会', '欧盟政策', '产业合作', '政策倡导', '市场分析'],
            'rating': 4.4
        },
        {
            'name': 'CSIA - 中国半导体行业协会',
            'url': 'https://www.csia.net.cn/',
            'description': '中国半导体行业协会(CSIA)成立于1990年，是中国半导体产业的权威行业组织。致力于促进中国半导体产业发展、行业自律、政策建议和国际交流合作，是连接政府、企业和市场的重要桥梁。',
            'target_audience': '中国半导体企业、政府部门、研究院所、投资机构、行业媒体',
            'use_case': '了解中国半导体政策、参与行业标准制定、获取产业数据、参加行业会议和展览',
            'tags': ['CSIA', '中国半导体协会', '产业政策', '行业统计', '标准制定', '产业发展'],
            'rating': 4.6
        },
        {
            'name': 'Semiconductor Digest',
            'url': 'https://www.semiconductor-digest.com/',
            'description': 'Semiconductor Digest是专业的半导体行业媒体平台，提供全面的产业新闻、技术分析、市场趋势和深度报道。覆盖半导体设计、制造、封测、设备材料等全产业链，是业内人士获取行业资讯的重要渠道。',
            'target_audience': '半导体工程师、产业分析师、企业高管、投资者、技术研发人员',
            'use_case': '获取行业新闻、技术趋势分析、市场报告阅读、产品发布信息、专家观点',
            'tags': ['半导体媒体', '行业新闻', '技术分析', '市场趋势', '产业报道', '专业媒体'],
            'rating': 4.3
        },
        {
            'name': 'Stratview Research - 半导体市场研究',
            'url': 'https://www.stratviewresearch.com/',
            'description': 'Stratview Research是专业的市场研究机构，专注于半导体和电子行业的深度分析。提供全面的市场报告、竞争分析、技术趋势预测和商业策略咨询，帮助企业制定数据驱动的商业决策。',
            'target_audience': '企业战略部门、市场分析师、投资机构、咨询公司、商业开发团队',
            'use_case': '市场研究报告、竞争分析、行业预测、投资决策支持、商业策略制定',
            'tags': ['市场研究', '行业分析', '竞争情报', '投资分析', '商业咨询', '数据报告'],
            'rating': 4.2
        },
        {
            'name': 'NIST National Semiconductor Technology Center',
            'url': 'https://www.nist.gov/chips/research-development-programs/national-semiconductor-technology-center',
            'description': '美国国家标准与技术研究院(NIST)国家半导体技术中心是美国CHIPS法案框架下的重要研发机构。专注于前沿半导体技术研发、标准制定和产业合作，推动美国半导体技术创新和制造能力提升。',
            'target_audience': '研究机构、半导体企业、政府部门、技术标准制定者、学术界',
            'use_case': '前沿技术研发、标准制定参与、政府项目合作、技术路线图制定、产学研合作',
            'tags': ['NIST', 'CHIPS法案', '技术研发', '标准制定', '政府项目', '产学研合作'],
            'rating': 4.5
        }
    ]
    
    return websites

def main():
    """主函数"""
    logger.info("开始批量添加半导体行业门户网站...")
    
    try:
        # 创建数据库更新器
        updater = SupabaseUpdater()
        
        # 获取行业门户分类ID
        category_id = updater.get_industry_portal_category_id()
        
        if not category_id:
            logger.error("无法获取行业门户分类ID")
            return False
        
        # 获取网站列表
        websites = get_industry_portal_websites()
        
        # 批量添加网站
        success_count = 0
        total_count = len(websites)
        
        for website in websites:
            if updater.add_website(website, category_id):
                success_count += 1
        
        logger.info(f"✅ 批量添加完成! 成功: {success_count}/{total_count}")
        logger.info("💡 现在可以在网站导航的'行业门户'分类中看到这些网站了")
        
        return success_count == total_count
        
    except Exception as e:
        logger.error(f"程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)