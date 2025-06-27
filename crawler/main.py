#!/usr/bin/env python3
"""
IC123 爬虫系统主程序
支持手动运行和定时调度两种模式
"""

import asyncio
import argparse
import sys
from datetime import datetime
from loguru import logger

from scheduler import CrawlerScheduler
from scrapers.news_scraper import run_news_scraper
from scrapers.website_checker import run_website_checker
from scrapers.iccircle_scraper import run_iccircle_scraper
from utils.database import db

def setup_logger(log_level: str = "INFO"):
    """设置日志"""
    logger.remove()
    logger.add(
        sys.stdout,
        level=log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    logger.add(
        "logs/crawler_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="30 days",
        level=log_level,
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}"
    )

async def run_news_task():
    """运行新闻爬取任务"""
    logger.info("🚀 Starting news scraping task")
    
    try:
        results = await run_news_scraper()
        
        logger.info("📊 News scraping results:")
        total_items = 0
        for source, count in results.items():
            logger.info(f"  - {source}: {count} items")
            total_items += count
        
        logger.success(f"✅ News scraping completed. Total: {total_items} items")
        return results
        
    except Exception as e:
        logger.error(f"❌ News scraping failed: {e}")
        raise

async def run_website_task():
    """运行网站检查任务"""
    logger.info("🔍 Starting website checking task")
    
    try:
        results = await run_website_checker()
        
        logger.info("📊 Website checking results:")
        logger.info(f"  - Total checked: {results['total_checked']}")
        logger.info(f"  - Available: {results['available']}")
        logger.info(f"  - Unavailable: {results['unavailable']}")
        
        if results['errors']:
            logger.warning(f"  - Errors: {len(results['errors'])}")
            for error in results['errors']:
                logger.warning(f"    • {error['website']}: {error['error']}")
        
        logger.success("✅ Website checking completed")
        return results
        
    except Exception as e:
        logger.error(f"❌ Website checking failed: {e}")
        raise

async def run_iccircle_task():
    """运行IC技术圈爬虫任务"""
    logger.info("🎯 Starting IC Circle scraping task")
    
    try:
        results = await run_iccircle_scraper()
        
        logger.info("📊 IC Circle scraping results:")
        logger.info(f"  - WeChat accounts: {results['wechat_accounts']} items")
        
        logger.success(f"✅ IC Circle scraping completed. Total: {results['wechat_accounts']} accounts")
        return results
        
    except Exception as e:
        logger.error(f"❌ IC Circle scraping failed: {e}")
        raise

async def run_ai_summary_task():
    """运行AI概要生成任务"""
    logger.info("🤖 Starting AI summary generation task")
    
    try:
        processed_count = await db.batch_process_ai_summaries(batch_size=10)
        
        logger.info("📊 AI summary generation results:")
        logger.info(f"  - Processed: {processed_count} items")
        
        logger.success(f"✅ AI summary generation completed. Total: {processed_count} items")
        return {"processed_count": processed_count}
        
    except Exception as e:
        logger.error(f"❌ AI summary generation failed: {e}")
        raise

async def run_cleanup_task():
    """运行数据清理任务"""
    logger.info("🧹 Starting database cleanup task")
    
    try:
        # 显示清理前的统计
        stats_before = await db.get_database_stats()
        logger.info("📊 Database stats before cleanup:")
        for table, count in stats_before.items():
            logger.info(f"  - {table}: {count} records")
        
        # 清理重复的新闻
        news_cleaned = await db.clean_duplicate_news()
        
        # 清理重复的网站
        websites_cleaned = await db.clean_duplicate_websites()
        
        # 清理重复的微信公众号
        wechat_cleaned = await db.clean_duplicate_wechat_accounts()
        
        # 删除不可用的网站
        inactive_websites_deleted = await db.delete_inactive_websites()
        
        # 显示清理后的统计
        stats_after = await db.get_database_stats()
        logger.info("📊 Database stats after cleanup:")
        for table, count in stats_after.items():
            logger.info(f"  - {table}: {count} records")
        
        logger.success(f"✅ Cleanup completed. Removed {news_cleaned} duplicate news, {websites_cleaned} duplicate websites, {wechat_cleaned} duplicate WeChat accounts, and {inactive_websites_deleted} inactive websites")
        return {
            "news_cleaned": news_cleaned, 
            "websites_cleaned": websites_cleaned,
            "wechat_cleaned": wechat_cleaned,
            "inactive_websites_deleted": inactive_websites_deleted
        }
        
    except Exception as e:
        logger.error(f"❌ Database cleanup failed: {e}")
        raise

async def run_remove_inactive_task():
    """运行删除不可用网站任务"""
    logger.info("🗑️ Starting inactive websites removal task")
    
    try:
        # 显示删除前的统计
        stats_before = await db.get_database_stats()
        logger.info("📊 Database stats before removal:")
        for table, count in stats_before.items():
            logger.info(f"  - {table}: {count} records")
        
        # 删除不可用的网站
        deleted_count = await db.delete_inactive_websites()
        
        # 显示删除后的统计
        stats_after = await db.get_database_stats()
        logger.info("📊 Database stats after removal:")
        for table, count in stats_after.items():
            logger.info(f"  - {table}: {count} records")
        
        logger.success(f"✅ Inactive websites removal completed. Deleted {deleted_count} websites")
        return {"inactive_websites_deleted": deleted_count}
        
    except Exception as e:
        logger.error(f"❌ Inactive websites removal failed: {e}")
        raise

async def run_update_task():
    """运行完整数据更新任务（清理+爬取）"""
    logger.info("🔄 Starting complete data update task")
    
    try:
        # 1. 先清理重复数据
        logger.info("Step 1: Cleaning duplicate data...")
        cleanup_results = await run_cleanup_task()
        
        await asyncio.sleep(2)  # 短暂等待
        
        # 2. 爬取最新新闻
        logger.info("Step 2: Fetching latest news...")
        news_results = await run_news_task()
        
        await asyncio.sleep(2)  # 短暂等待
        
        # 3. 爬取IC技术圈公众号
        logger.info("Step 3: Fetching IC Circle WeChat accounts...")
        iccircle_results = await run_iccircle_task()
        
        await asyncio.sleep(2)  # 短暂等待
        
        # 4. 生成AI概要
        logger.info("Step 4: Generating AI summaries...")
        ai_summary_results = await run_ai_summary_task()
        
        await asyncio.sleep(2)  # 短暂等待
        
        # 5. 检查网站状态
        logger.info("Step 5: Checking website status...")
        website_results = await run_website_task()
        
        logger.success("✅ Complete data update finished")
        return {
            "cleanup": cleanup_results,
            "news": news_results,
            "iccircle": iccircle_results,
            "ai_summary": ai_summary_results,
            "websites": website_results
        }
        
    except Exception as e:
        logger.error(f"❌ Data update failed: {e}")
        raise

def run_scheduler():
    """运行定时调度器"""
    logger.info("⏰ Starting crawler scheduler")
    
    try:
        scheduler = CrawlerScheduler()
        
        # 显示调度状态
        status = scheduler.get_schedule_status()
        logger.info(f"📅 Scheduler configuration:")
        logger.info(f"  - News scraping hours: {status['news_hours']}")
        logger.info(f"  - Website check interval: every {status['website_check_days']} days")
        logger.info(f"  - Total scheduled jobs: {status['total_jobs']}")
        
        logger.info("🎯 Scheduler is running. Press Ctrl+C to stop.")
        scheduler.start()
        
    except KeyboardInterrupt:
        logger.info("⏹️ Scheduler stopped by user")
    except Exception as e:
        logger.error(f"❌ Scheduler error: {e}")
        raise

async def show_status():
    """显示系统状态"""
    logger.info("📋 IC123 Crawler System Status")
    
    try:
        # 获取数据库连接状态
        categories = await db.get_categories()
        logger.info(f"  - Database: ✅ Connected ({len(categories)} categories)")
        
        # 获取数据库统计
        stats = await db.get_database_stats()
        logger.info("📊 Database statistics:")
        for table, count in stats.items():
            logger.info(f"  - {table}: {count} records")
        
        # 获取最近的新闻数量
        recent_titles = await db.get_recent_news_titles(1)
        logger.info(f"  - Recent news (24h): {len(recent_titles)} items")
        
        # 获取网站数量
        websites = await db.get_websites_for_check()
        logger.info(f"  - Websites to monitor: {len(websites)}")
        
        logger.success("✅ System status check completed")
        
    except Exception as e:
        logger.error(f"❌ Status check failed: {e}")
        raise

def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="IC123 Crawler System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py news           # Run news scraping once
  python main.py websites       # Check all websites once  
  python main.py iccircle       # Scrape IC Circle WeChat accounts
  python main.py ai-summary     # Generate AI summaries for news
  python main.py cleanup        # Clean duplicate data
  python main.py remove-inactive # Remove inactive websites
  python main.py update         # Complete update (cleanup + scraping)
  python main.py schedule       # Start scheduled crawler
  python main.py status         # Show system status
  python main.py --log-level DEBUG news  # Run with debug logging
        """
    )
    
    parser.add_argument(
        'command',
        choices=['news', 'websites', 'iccircle', 'ai-summary', 'cleanup', 'remove-inactive', 'update', 'schedule', 'status'],
        help='Command to execute'
    )
    
    parser.add_argument(
        '--log-level',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default='INFO',
        help='Set logging level (default: INFO)'
    )
    
    args = parser.parse_args()
    
    # 设置日志
    setup_logger(args.log_level)
    
    # 显示启动信息
    logger.info("🎯 IC123 Crawler System")
    logger.info(f"📅 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"🔧 Command: {args.command}")
    logger.info(f"📝 Log level: {args.log_level}")
    logger.info("-" * 50)
    
    try:
        if args.command == 'news':
            asyncio.run(run_news_task())
            
        elif args.command == 'websites':
            asyncio.run(run_website_task())
            
        elif args.command == 'iccircle':
            asyncio.run(run_iccircle_task())
            
        elif args.command == 'ai-summary':
            asyncio.run(run_ai_summary_task())
            
        elif args.command == 'cleanup':
            asyncio.run(run_cleanup_task())
            
        elif args.command == 'remove-inactive':
            asyncio.run(run_remove_inactive_task())
            
        elif args.command == 'update':
            asyncio.run(run_update_task())
            
        elif args.command == 'schedule':
            run_scheduler()
            
        elif args.command == 'status':
            asyncio.run(show_status())
            
    except KeyboardInterrupt:
        logger.info("⏹️ Operation interrupted by user")
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"❌ Operation failed: {e}")
        sys.exit(1)
    
    logger.info("🎉 Operation completed successfully")

if __name__ == "__main__":
    main()