#!/usr/bin/env python3
"""
IC123爬虫系统状态检查脚本
"""

import asyncio
from utils.database import db
from utils.ai_summarizer import ai_summarizer
from datetime import datetime, timezone, timedelta

async def check_system_status():
    """检查系统状态"""
    print("🎯 IC123 爬虫系统状态检查")
    print("=" * 50)
    
    # 检查AI服务状态
    print("🤖 AI服务状态:")
    ai_stats = ai_summarizer.get_stats()
    print(f"   可用服务: {ai_stats['available_services']}")
    print(f"   首选服务: {ai_stats['preferred_service']}")
    print(f"   是否启用: {ai_stats['is_enabled']}")
    print()
    
    # 检查数据库连接
    print("📊 数据库连接状态:")
    try:
        # 检查新闻数量
        news_result = db.client.table('news').select('id', count='exact').execute()
        total_news = news_result.count
        
        # 检查最近24小时的新闻
        yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
        recent_result = db.client.table('news').select('id', count='exact').gte('created_at', yesterday).execute()
        recent_news = recent_result.count
        
        print(f"   ✅ 数据库连接正常")
        print(f"   📰 总新闻数: {total_news}")
        print(f"   🆕 24小时内新增: {recent_news}")
        
        # 显示最新的3条新闻
        latest_news = db.client.table('news').select('title, source, created_at').order('created_at', desc=True).limit(3).execute()
        if latest_news.data:
            print("   📝 最新新闻:")
            for i, news in enumerate(latest_news.data, 1):
                print(f"      {i}. {news['title'][:50]}... ({news['source']})")
        
    except Exception as e:
        print(f"   ❌ 数据库连接失败: {e}")
    
    print()
    
    # 检查网站数量
    print("🌐 网站数据状态:")
    try:
        websites_result = db.client.table('websites').select('id', count='exact').execute()
        total_websites = websites_result.count
        print(f"   📈 总网站数: {total_websites}")
    except Exception as e:
        print(f"   ❌ 网站数据查询失败: {e}")
    
    print()
    print("✅ 系统状态检查完成")

if __name__ == "__main__":
    asyncio.run(check_system_status())