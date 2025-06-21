# IC123 爬虫系统

IC123爬虫系统是一个专业的IC行业信息聚合平台的数据采集系统，支持新闻爬取、网站监控、微信公众号管理等功能。

## 🚀 功能特性

### 新闻爬取
- **多源支持**: RSS订阅源和HTML页面解析
- **智能过滤**: 基于关键词的IC行业相关性检查
- **内容提取**: 自动提取标题、摘要、正文、发布时间
- **去重机制**: 基于标题和时间的重复检测
- **自动分类**: 根据内容自动分类新闻

### 网站监控
- **可用性检查**: 定期检查网站HTTP状态
- **响应时间监控**: 记录网站响应时间
- **错误报告**: 详细的错误信息和状态码
- **批量检查**: 支持批量和单独检查

### 调度系统
- **定时任务**: 支持cron风格的定时执行
- **手动执行**: 支持命令行手动触发
- **日志记录**: 详细的执行日志和错误追踪
- **状态监控**: 实时查看系统运行状态

### 微信公众号管理
- **管理**: 管理和更新IC技术相关的微信公众号
- **IC技术圈集成**: 从IC技术圈平台获取优质公众号资源
- **数据清理**: 自动清理重复和无效数据

## 📦 安装部署

### 环境要求
- Python >= 3.8
- pip >= 21.0

### 安装依赖
```bash
cd crawler
pip install -r requirements.txt
```

### 环境配置
1. 复制配置文件：
```bash
cp .env.example .env
```

2. 配置Supabase连接：
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. 创建日志目录：
```bash
mkdir logs
```

## 🎯 使用方法

### 命令行接口
```bash
# 运行新闻爬取（一次性）
python main.py news

# 检查所有网站状态（一次性）  
python main.py websites

# 启动定时调度器
python main.py schedule

# 查看系统状态
python main.py status

# 调试模式运行
python main.py --log-level DEBUG news

# 爬取IC技术圈公众号
python main.py iccircle

# 清理重复数据
python main.py cleanup

# 删除不可用网站
python main.py remove-inactive

# 完整数据更新（推荐）
python main.py update
```

### 新闻源配置
在 `config/settings.py` 中配置新闻源：

```python
NEWS_SOURCES = [
    {
        'name': '集微网',
        'url': 'https://www.jimwei.com/',
        'rss': 'https://www.jimwei.com/feed',  # RSS源（可选）
        'selectors': {  # HTML选择器
            'title': 'h1.entry-title',
            'content': '.entry-content',
            'summary': '.entry-summary',
            'date': '.entry-date'
        }
    }
]
```

### 调度配置
```python
# 新闻爬取时间（小时）
SCHEDULE_NEWS_HOURS = [6, 12, 18]  # 每天6点、12点、18点

# 网站检查间隔（天）
SCHEDULE_WEBSITES_DAYS = 7  # 每周检查一次
```

## 🔧 系统架构

```
crawler/
├── config/
│   └── settings.py       # 配置文件
├── scrapers/
│   ├── news_scraper.py   # 新闻爬取器
│   └── website_checker.py # 网站检查器
├── utils/
│   ├── database.py       # 数据库操作
│   └── helpers.py        # 工具函数
├── scheduler.py          # 任务调度器
├── main.py              # 主程序入口
└── requirements.txt     # 依赖包
```

## 📊 数据流程

### 新闻爬取流程
1. **源识别**: 根据配置识别RSS或HTML源
2. **内容提取**: 使用选择器提取标题、内容、时间
3. **相关性检查**: 基于关键词判断是否为IC相关内容
4. **去重处理**: 检查标题是否已存在
5. **内容增强**: 提取完整正文、生成摘要、自动分类
6. **数据保存**: 存储到Supabase数据库

### 网站检查流程
1. **获取列表**: 从数据库获取活跃网站列表
2. **并发检查**: 异步检查HTTP状态和响应时间
3. **结果分析**: 分析状态码和响应内容
4. **状态更新**: 更新数据库中的网站状态
5. **错误报告**: 记录检查失败的详细信息

## 🛠️ 开发说明

### 添加新的新闻源
1. 在 `config/settings.py` 中添加源配置
2. 测试选择器是否正确提取内容
3. 验证内容相关性检查

### 自定义内容过滤
修改 `utils/helpers.py` 中的过滤函数：
- `is_valid_ic_content()`: 相关性检查
- `categorize_news_content()`: 自动分类
- `extract_keywords()`: 关键词提取

### 扩展检查功能
在 `scrapers/website_checker.py` 中添加新的检查逻辑：
- SSL证书检查
- 页面加载时间
- 特定内容验证

## 📝 日志系统

### 日志级别
- **DEBUG**: 详细的调试信息
- **INFO**: 一般信息和进度
- **WARNING**: 警告信息
- **ERROR**: 错误信息

### 日志文件
- 控制台输出：彩色格式化显示
- 文件输出：`logs/crawler_YYYY-MM-DD.log`
- 自动轮转：每天新建文件，保留30天

### 日志格式
```
2024-01-01 12:00:00 | INFO | news_scraper:scrape_all_sources:45 - Starting news scraping
```

## ⚡ 性能优化

### 并发控制
- 使用 `aiohttp` 进行异步HTTP请求
- 限制并发请求数量避免被封IP
- 添加请求延迟减少服务器压力

### 内存优化
- 分批处理大量数据
- 及时释放不需要的对象
- 使用生成器处理大文件

### 网络优化
- 设置合理的超时时间
- 支持代理服务器配置
- 实现请求重试机制

## 🔒 安全考虑

### 反爬虫对策
- 随机User-Agent
- 请求间隔控制
- 支持代理轮换
- 错误重试机制

### 数据安全
- 敏感配置环境变量化
- 数据库连接加密
- 输入数据验证

## 📈 监控和维护

### 健康检查
```bash
# 检查系统状态
python main.py status

# 查看最近日志
tail -f logs/crawler_$(date +%Y-%m-%d).log

# 检查数据库连接
python -c "from utils.database import db; print('DB OK')"
```

### 常见问题

**Q: 爬取失败怎么办？**
A: 检查网络连接、目标网站状态、选择器配置

**Q: 如何添加新的新闻源？**
A: 在settings.py中添加配置，测试选择器有效性

**Q: 调度器不工作？**
A: 检查系统时间、cron表达式、进程状态

## 📞 技术支持

- 查看日志文件获取详细错误信息
- 检查配置文件是否正确
- 验证网络连接和数据库访问
- 更新依赖包到最新版本

## 🎯 IC技术圈集成

IC技术圈是一个优质的IC技术资源平台，包含88位成员的专业公众号。系统会自动从中提取高质量的IC技术公众号。

### 支持的公众号类型
- IC验证技术
- IC设计技术  
- ASIC设计
- FPGA技术
- EDA工具
- 芯片设计
- 行业分析
- 人才服务

### 使用方法
```bash
# 单独运行IC技术圈爬虫
python main.py iccircle
```

## 📊 数据清理和维护

### 使用方法
```bash
# 清理所有重复数据
python main.py cleanup

# 删除不可用的网站
python main.py remove-inactive

# 完整的数据更新流程
python main.py update
```

## 📅 定时任务调度

### 使用方法
```bash
# 启动后台调度器
python main.py schedule
```

### 默认调度计划
- 新闻爬取：每4小时执行一次
- 网站检查：每天早上8点执行
- IC技术圈更新：每周日凌晨2点执行
- 数据清理：每天凌晨3点执行

## 📅 最佳实践

### 使用方法
```bash
# 每周运行一次完整更新
python main.py update

# 定期检查系统状态
python main.py status
```

## 📅 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查环境变量配置
   - 确认Supabase服务状态

2. **爬虫失败**
   - 检查网络连接
   - 验证目标网站是否可访问
   - 查看日志了解具体错误

3. **重复数据**
   - 运行数据清理命令
   - 检查去重逻辑

### 调试技巧
```bash
# 使用详细日志模式
python main.py --log-level DEBUG command

# 检查特定功能
python main.py status

# 手动测试API连接
curl -s "http://localhost:3001/api/wechat?limit=5"
```

## 📅 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证。

## 📅 更新日志

### v1.2.0 (2025-06-21)
- ✨ 新增IC技术圈公众号爬虫
- 🧹 改进数据清理算法
- 📈 增强系统状态监控
- 🔧 优化定时任务调度

### v1.1.0 (2025-06-20)
- 🌐 网站状态检查功能
- 📊 数据统计和分析
- 🔄 自动重复数据清理

### v1.0.0 (2025-06-19)
- 🎯 基础新闻爬取功能
- 📱 微信公众号管理
- ⏰ 定时任务支持