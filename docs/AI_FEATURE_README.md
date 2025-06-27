# IC123 AI新闻概要功能说明

## 功能概述

IC123平台新增了AI驱动的新闻概要生成功能，通过人工智能技术为IC行业新闻自动生成简洁、准确的概要和关键词，提升用户阅读体验。

## 主要特性

### 🤖 智能概要生成
- **多AI服务支持**: 支持OpenAI GPT、Claude、Gemini等主流AI服务
- **智能内容理解**: 专门针对半导体行业内容优化的提示词
- **关键词提取**: 自动提取新闻关键词，便于搜索和分类
- **质量控制**: 概要长度控制在200字以内，突出核心信息

### 📊 自动化流程
- **实时生成**: 新闻爬取时自动生成AI概要
- **批量处理**: 支持对历史新闻批量生成概要
- **定时任务**: 每天10:00自动处理未生成概要的新闻
- **故障恢复**: AI服务失败时自动切换到备用服务

### 🎨 用户界面优化
- **优先显示**: 前端优先显示AI生成的概要
- **标识明确**: 使用"AI概要"标签区分AI生成内容
- **关键词展示**: 在新闻详情页展示AI提取的关键词
- **降级处理**: AI概要不可用时自动显示原始摘要

## 系统架构

### 数据库设计
```sql
-- 新增AI相关字段
ALTER TABLE news ADD COLUMN ai_summary TEXT;
ALTER TABLE news ADD COLUMN ai_processed BOOLEAN DEFAULT false;
ALTER TABLE news ADD COLUMN ai_keywords TEXT[];
ALTER TABLE news ADD COLUMN ai_processed_at TIMESTAMP WITH TIME ZONE;
```

### 核心组件

#### 1. AI概要生成器 (`crawler/utils/ai_summarizer.py`)
- **多服务支持**: 统一接口支持多种AI服务
- **智能提示词**: 针对半导体行业优化的提示词模板
- **错误处理**: 完善的错误处理和服务切换机制
- **配置灵活**: 支持服务优先级和参数配置

#### 2. 爬虫集成 (`crawler/scrapers/news_scraper.py`)
- **实时处理**: 新闻爬取时自动调用AI服务
- **异步处理**: 使用异步编程提高处理效率
- **错误容错**: AI处理失败不影响新闻保存

#### 3. 后端API增强 (`backend/src/routes/news.ts`)
- **数据处理**: API响应自动包含`display_summary`和`has_ai_summary`字段
- **管理接口**: 提供管理员手动触发AI概要生成的接口
- **类型安全**: 完整的TypeScript类型定义

#### 4. 前端展示优化
- **主页显示**: 主页新闻卡片优先显示AI概要
- **列表页面**: 新闻列表页面标识AI概要
- **详情页面**: 详情页面展示AI概要和关键词
- **分享功能**: 分享时使用AI概要作为描述

## 配置说明

### 环境变量配置
```bash
# AI服务配置
OPENAI_API_KEY=your_openai_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# AI概要配置
AI_SUMMARY_SERVICE=openai          # 首选AI服务
AI_MAX_CONTENT_LENGTH=4000         # 最大处理内容长度
AI_SUMMARY_MAX_LENGTH=200          # 概要最大长度
```

### AI服务优先级
1. **OpenAI GPT-3.5-turbo**: 默认首选服务，成本适中，质量稳定
2. **Claude Haiku**: 备用服务，速度快，适合大量处理
3. **Gemini Pro**: 备用服务，免费额度较大

## 使用指南

### 部署步骤

1. **数据库升级**
   ```bash
   # 执行数据库升级脚本
   psql -h your-db-host -d your-db-name -f database/add_ai_summary_fields.sql
   ```

2. **配置AI服务**
   ```bash
   # 复制配置文件
   cp crawler/.env.example crawler/.env
   
   # 编辑配置文件，添加AI API密钥
   nano crawler/.env
   ```

3. **安装依赖**
   ```bash
   # 爬虫依赖
   cd crawler
   pip install -r requirements.txt
   
   # 后端依赖
   cd ../backend
   npm install
   
   # 前端依赖
   cd ../frontend
   npm install
   ```

4. **一键部署**
   ```bash
   # 使用自动部署脚本
   ./scripts/deploy_ai_feature.sh
   ```

### 手动操作

#### 运行AI概要生成
```bash
# 单次运行
cd crawler
python main.py ai-summary

# 查看状态
python main.py status

# 启动定时调度
python main.py schedule
```

#### 管理接口调用
```bash
# 手动触发AI概要生成
curl -X POST http://localhost:8787/api/news/admin/generate-ai-summaries

# 查看新闻列表
curl http://localhost:8787/api/news
```

### 监控和维护

#### 日志查看
```bash
# 爬虫日志
tail -f crawler/logs/crawler_$(date +%Y-%m-%d).log

# 调度器日志
tail -f crawler/logs/scheduler.log
```

#### 性能监控
- **AI处理成功率**: 监控`ai_processed`字段的比例
- **处理时间**: 监控AI概要生成的平均耗时
- **API调用量**: 监控各AI服务的API使用量

#### 故障排除
1. **AI服务连接失败**: 检查API密钥和网络连接
2. **概要质量不佳**: 调整提示词模板或切换AI服务
3. **处理速度慢**: 调整批处理大小或增加并发数

## 技术细节

### AI提示词模板
```python
prompt = f"""
请为以下半导体行业新闻生成一个简洁的概要，要求：

1. 概要长度控制在{self.summary_max_length}字以内
2. 突出新闻的核心内容和关键信息
3. 使用专业的半导体行业术语
4. 保持客观中性的语调
5. 同时提取3-5个关键词

新闻来源：{source}

{content}

请按以下JSON格式返回结果：
{{
    "summary": "新闻概要内容...",
    "keywords": ["关键词1", "关键词2", "关键词3"]
}}
"""
```

### 数据库索引优化
```sql
-- AI处理状态索引
CREATE INDEX idx_news_ai_processed ON news(ai_processed);

-- AI关键词索引
CREATE INDEX idx_news_ai_keywords ON news USING GIN(ai_keywords);

-- AI处理时间索引
CREATE INDEX idx_news_ai_processed_at ON news(ai_processed_at);
```

### API响应格式
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "新闻标题",
      "summary": "原始摘要",
      "ai_summary": "AI生成的概要",
      "display_summary": "AI生成的概要",
      "has_ai_summary": true,
      "ai_keywords": ["关键词1", "关键词2"],
      "ai_processed": true,
      "ai_processed_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## 扩展计划

### 短期优化
- [ ] 支持更多AI服务提供商
- [ ] 概要质量评分和反馈机制
- [ ] 用户自定义概要长度
- [ ] 多语言概要生成

### 长期规划
- [ ] 基于用户反馈的AI模型微调
- [ ] 智能新闻分类和标签生成
- [ ] 相关新闻推荐算法
- [ ] 新闻趋势分析和预测

## 联系方式

如有问题或建议，请联系开发团队：
- 技术支持: tech@ic123.com
- 问题反馈: https://github.com/ic123/issues

---

**版本**: v1.0.0  
**更新时间**: 2024年12月  
**维护团队**: IC123开发团队