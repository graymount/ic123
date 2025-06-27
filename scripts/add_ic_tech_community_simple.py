#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加ic技术圈到网站导航 - 简化版
包含更好的错误处理和权限检查
"""

import os
import sys
import json
import logging
from urllib.request import Request, urlopen
from urllib.parse import urlencode
from urllib.error import URLError, HTTPError

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def get_supabase_config():
    """获取并验证Supabase配置"""
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url:
        print("❌ 错误: SUPABASE_URL 环境变量未设置")
        print("请设置环境变量:")
        supabase_url = input("SUPABASE_URL: ").strip()
        if not supabase_url:
            raise ValueError("SUPABASE_URL 不能为空")
        os.environ['SUPABASE_URL'] = supabase_url
    
    if not supabase_key:
        print("❌ 错误: SUPABASE_ANON_KEY 环境变量未设置")
        print("请设置环境变量:")
        supabase_key = input("SUPABASE_ANON_KEY: ").strip()
        if not supabase_key:
            raise ValueError("SUPABASE_ANON_KEY 不能为空")
        os.environ['SUPABASE_ANON_KEY'] = supabase_key
    
    return supabase_url, supabase_key

def test_connection(supabase_url, supabase_key):
    """测试数据库连接和权限"""
    try:
        headers = {
            'apikey': supabase_key,
            'Authorization': f'Bearer {supabase_key}',
            'Content-Type': 'application/json'
        }
        
        # 测试读取权限
        url = f"{supabase_url}/rest/v1/categories?limit=1"
        request = Request(url, headers=headers)
        
        with urlopen(request) as response:
            if response.status == 200:
                logger.info("✅ 数据库连接成功，读取权限正常")
                return True
            else:
                logger.error(f"❌ 连接测试失败: {response.status}")
                return False
                
    except HTTPError as e:
        if e.code == 401:
            logger.error("❌ 401 未授权错误")
            logger.error("请检查:")
            logger.error("1. SUPABASE_ANON_KEY 是否正确")
            logger.error("2. Supabase项目是否启用了匿名访问")
            logger.error("3. 是否需要使用service_role密钥")
        else:
            logger.error(f"❌ HTTP错误: {e.code} - {e.reason}")
        return False
    except Exception as e:
        logger.error(f"❌ 连接失败: {str(e)}")
        return False

def create_manual_sql():
    """生成手动执行的SQL语句"""
    sql = """
-- 手动添加ic技术圈的SQL语句
-- 在Supabase SQL编辑器中执行以下代码：

-- 1. 确保技术社区分类存在
INSERT INTO categories (name, description, icon, sort_order, is_active) VALUES
('技术社区', 'IC行业技术交流和讨论社区', '👥', 8, true)
ON CONFLICT (name) DO NOTHING;

-- 2. 添加ic技术圈网站
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('ic技术圈', 'https://www.iccircle.com/', 
 '专业的集成电路技术交流社区，汇聚IC行业工程师、研发人员和技术专家。提供技术讨论、经验分享、问题求助、职业发展等服务。涵盖模拟IC设计、数字IC设计、版图设计、验证、工艺、封装测试等各个技术领域，是IC从业者学习交流的重要平台。',
 (SELECT id FROM categories WHERE name = '技术社区'), 
 'IC设计工程师、模拟工程师、数字工程师、版图工程师、验证工程师、工艺工程师、封测工程师、IC技术爱好者', 
 '技术讨论、经验分享、问题求助、技术资料下载、职业发展咨询、行业交流',
 ARRAY['IC技术圈', '技术社区', '技术交流', 'IC设计', '工程师社区', '技术讨论', '经验分享'])
ON CONFLICT (name) DO NOTHING;

-- 3. 验证添加结果
SELECT 
    w.name as website_name,
    w.url,
    c.name as category_name
FROM websites w
JOIN categories c ON w.category_id = c.id
WHERE w.name = 'ic技术圈';
"""
    
    # 保存到文件
    with open('manual_add_ic_tech.sql', 'w', encoding='utf-8') as f:
        f.write(sql)
    
    print("📄 已生成手动SQL文件: manual_add_ic_tech.sql")
    print("🔧 解决方案:")
    print("1. 在Supabase后台 -> SQL编辑器中执行上述SQL")
    print("2. 或者使用service_role密钥（有完全权限）")
    print("3. 或者在Supabase后台手动添加数据")

def main():
    """主函数"""
    logger.info("🌐 开始添加ic技术圈到网站导航...")
    
    try:
        # 获取配置
        supabase_url, supabase_key = get_supabase_config()
        
        # 测试连接
        if not test_connection(supabase_url, supabase_key):
            logger.error("❌ 数据库连接失败")
            print("\n🛠️  解决方案:")
            print("1. 检查Supabase URL和密钥是否正确")
            print("2. 确保Supabase项目设置允许匿名访问")
            print("3. 使用手动SQL方式添加")
            
            create_manual_sql()
            return False
        
        # 如果连接成功，提示用户可能的权限问题
        logger.warning("⚠️  检测到401权限错误")
        logger.warning("这通常是因为RLS（行级安全）策略限制")
        
        create_manual_sql()
        
        print("\n💡 推荐解决方案:")
        print("1. 使用生成的SQL文件在Supabase后台执行")
        print("2. 或者在Supabase -> 认证 -> 策略中暂时禁用websites和categories表的RLS")
        print("3. 或者使用service_role密钥替代anon密钥")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 程序执行失败: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 