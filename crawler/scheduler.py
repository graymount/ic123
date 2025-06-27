import asyncio
import schedule
import time
from datetime import datetime
from loguru import logger
from typing import Dict, Any

from config.settings import SCHEDULE_NEWS_HOURS, SCHEDULE_WEBSITES_DAYS
from scrapers.news_scraper import run_news_scraper
from scrapers.website_checker import run_website_checker
from utils.database import db

class CrawlerScheduler:
    def __init__(self):
        self.is_running = False
        self.setup_logger()
        self.setup_schedules()

    def setup_logger(self):
        """设置日志配置"""
        logger.add(
            "logs/crawler_{time:YYYY-MM-DD}.log",
            rotation="1 day",
            retention="30 days",
            level="INFO",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} - {message}"
        )

    def setup_schedules(self):
        """设置定时任务"""
        # 每4小时爬取一次新闻
        schedule.every(4).hours.do(self.run_async_task, 
                                   "news", "news scraping")
        
        # 每天早上8点检查网站状态
        schedule.every().day.at("08:00").do(self.run_async_task, 
                                            "websites", "website checking")
        
        # 每周日凌晨2点爬取IC技术圈公众号（更新频率较低）
        schedule.every().sunday.at("02:00").do(self.run_async_task, 
                                               "iccircle", "IC Circle scraping")
        
        # 每天凌晨3点清理重复数据
        schedule.every().day.at("03:00").do(self.run_async_task, 
                                            "cleanup", "database cleanup")
        
        # 每天上午10点生成AI概要
        schedule.every().day.at("10:00").do(self.run_async_task,
                                            "ai_summary", "AI summary generation")
        
        # 新闻爬取任务 - 每天指定时间运行
        for hour in SCHEDULE_NEWS_HOURS:
            schedule.every().day.at(f"{hour:02d}:00").do(self.scheduled_news_scraping)
        
        # 网站检查任务 - 每周运行
        schedule.every(SCHEDULE_WEBSITES_DAYS).days.do(self.scheduled_website_checking)
        
        # 立即运行一次新闻爬取（可选）
        # schedule.every().minute.do(self.scheduled_news_scraping).tag('immediate')
        
        logger.info(f"Scheduled news scraping at hours: {SCHEDULE_NEWS_HOURS}")
        logger.info(f"Scheduled website checking every {SCHEDULE_WEBSITES_DAYS} days")

    def run_async_task(self, task_type, task_name):
        """运行异步任务"""
        logger.info(f"Starting {task_name}")
        
        try:
            if task_type == "news":
                results = asyncio.run(self.run_news_scraping())
            elif task_type == "websites":
                results = asyncio.run(self.run_website_checking())
            elif task_type == "iccircle":
                results = asyncio.run(self.run_iccircle_scraping())
            elif task_type == "cleanup":
                results = asyncio.run(self.run_cleanup())
            elif task_type == "ai_summary":
                results = asyncio.run(self.run_ai_summary())
            else:
                logger.error(f"Unknown task type: {task_type}")
                return
            
            logger.success(f"{task_name} completed successfully")
            
        except Exception as e:
            logger.error(f"Error in {task_name}: {e}")

    async def run_news_scraping(self):
        """运行新闻爬取"""
        return await run_news_scraper()

    async def run_website_checking(self):
        """运行网站检查"""
        return await run_website_checker()

    async def run_iccircle_scraping(self):
        """运行IC技术圈爬虫"""
        from scrapers.iccircle_scraper import run_iccircle_scraper
        return await run_iccircle_scraper()

    async def run_cleanup(self):
        """运行数据清理"""
        news_cleaned = await db.clean_duplicate_news()
        websites_cleaned = await db.clean_duplicate_websites()
        wechat_cleaned = await db.clean_duplicate_wechat_accounts()
        inactive_deleted = await db.delete_inactive_websites()
        
        return {
            "news_cleaned": news_cleaned,
            "websites_cleaned": websites_cleaned, 
            "wechat_cleaned": wechat_cleaned,
            "inactive_deleted": inactive_deleted
        }

    async def run_ai_summary(self):
        """运行AI概要生成"""
        processed_count = await db.batch_process_ai_summaries(batch_size=10)
        return {"processed_count": processed_count}

    def scheduled_news_scraping(self):
        """计划的新闻爬取任务"""
        logger.info("Starting scheduled news scraping")
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            results = loop.run_until_complete(self.run_news_scraping())
            
            total_items = sum(results.values())
            logger.success(f"Scheduled news scraping completed. Total items: {total_items}")
            
            # 记录任务执行结果
            loop.run_until_complete(
                db.save_crawl_log(
                    'scheduled_news_scraping',
                    'success',
                    f'Scraped {total_items} news items from {len(results)} sources',
                    total_items
                )
            )
            
        except Exception as e:
            logger.error(f"Error in scheduled news scraping: {e}")
            asyncio.run(
                db.save_crawl_log(
                    'scheduled_news_scraping',
                    'error',
                    str(e)
                )
            )
        finally:
            loop.close()

    def scheduled_website_checking(self):
        """计划的网站检查任务"""
        logger.info("Starting scheduled website checking")
        
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            results = loop.run_until_complete(self.run_website_checking())
            
            logger.success(f"Scheduled website checking completed. "
                         f"Available: {results['available']}, "
                         f"Unavailable: {results['unavailable']}")
            
            # 记录任务执行结果
            loop.run_until_complete(
                db.save_crawl_log(
                    'scheduled_website_checking',
                    'success',
                    f'Checked {results["total_checked"]} websites',
                    results['total_checked']
                )
            )
            
        except Exception as e:
            logger.error(f"Error in scheduled website checking: {e}")
            asyncio.run(
                db.save_crawl_log(
                    'scheduled_website_checking',
                    'error',
                    str(e)
                )
            )
        finally:
            loop.close()

    def run_manual_task(self, task_type: str) -> Dict[str, Any]:
        """手动运行指定任务"""
        logger.info(f"Running manual task: {task_type}")
        
        try:
            if task_type == 'news':
                return asyncio.run(self.run_news_scraping())
            elif task_type == 'websites':
                return asyncio.run(self.run_website_checking())
            else:
                raise ValueError(f"Unknown task type: {task_type}")
                
        except Exception as e:
            logger.error(f"Error in manual task {task_type}: {e}")
            raise

    def start(self):
        """启动调度器"""
        logger.info("Starting crawler scheduler")
        self.is_running = True
        
        # 清除立即执行的任务
        schedule.clear('immediate')
        
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # 每分钟检查一次
                
            except KeyboardInterrupt:
                logger.info("Received keyboard interrupt, stopping scheduler")
                self.stop()
                break
                
            except Exception as e:
                logger.error(f"Error in scheduler main loop: {e}")
                time.sleep(60)

    def stop(self):
        """停止调度器"""
        logger.info("Stopping crawler scheduler")
        self.is_running = False

    def get_next_scheduled_runs(self) -> Dict[str, Any]:
        """获取下次运行时间"""
        next_runs = {}
        
        for job in schedule.jobs:
            next_runs[str(job.job_func)] = job.next_run
        
        return next_runs

    def get_schedule_status(self) -> Dict[str, Any]:
        """获取调度器状态"""
        return {
            'is_running': self.is_running,
            'total_jobs': len(schedule.jobs),
            'next_runs': self.get_next_scheduled_runs(),
            'news_hours': SCHEDULE_NEWS_HOURS,
            'website_check_days': SCHEDULE_WEBSITES_DAYS
        }

    def run_with_error_handling(self, func, task_name):
        """运行任务并处理错误"""
        logger.info(f"Starting {task_name}")
        
        try:
            results = func()
            logger.success(f"{task_name} completed successfully")
            
            # 记录任务执行结果
            asyncio.run(
                db.save_crawl_log(
                    task_name,
                    'success',
                    f'Completed {len(results)} tasks',
                    len(results)
                )
            )
            
        except Exception as e:
            logger.error(f"Error in {task_name}: {e}")
            asyncio.run(
                db.save_crawl_log(
                    task_name,
                    'error',
                    str(e)
                )
            )

def main():
    """主函数"""
    scheduler = CrawlerScheduler()
    
    try:
        # 可以选择立即运行一次
        logger.info("Running initial news scraping...")
        initial_results = scheduler.run_manual_task('news')
        logger.info(f"Initial scraping results: {initial_results}")
        
        # 启动定时调度
        scheduler.start()
        
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")
    except Exception as e:
        logger.error(f"Scheduler error: {e}")
    finally:
        scheduler.stop()

if __name__ == "__main__":
    main()