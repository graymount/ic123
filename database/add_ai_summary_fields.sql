-- 添加AI概要相关字段到news表
-- 用于存储AI生成的文章概要和处理状态

-- 添加AI概要字段
ALTER TABLE news ADD COLUMN ai_summary TEXT;
COMMENT ON COLUMN news.ai_summary IS 'AI生成的文章概要，用于快速展示文章要点';

-- 添加AI处理状态字段
ALTER TABLE news ADD COLUMN ai_processed BOOLEAN DEFAULT false;
COMMENT ON COLUMN news.ai_processed IS 'AI是否已处理该新闻，用于标记AI概要生成状态';

-- 添加AI关键词字段
ALTER TABLE news ADD COLUMN ai_keywords TEXT[];
COMMENT ON COLUMN news.ai_keywords IS 'AI提取的关键词数组，用于搜索和分类';

-- 添加AI处理时间字段
ALTER TABLE news ADD COLUMN ai_processed_at TIMESTAMP WITH TIME ZONE;
COMMENT ON COLUMN news.ai_processed_at IS 'AI处理完成的时间戳';

-- 为AI相关字段创建索引
CREATE INDEX idx_news_ai_processed ON news(ai_processed);
CREATE INDEX idx_news_ai_keywords ON news USING GIN(ai_keywords);
CREATE INDEX idx_news_ai_processed_at ON news(ai_processed_at);

-- 创建视图用于查询包含AI概要的新闻
CREATE OR REPLACE VIEW news_with_ai AS
SELECT 
    id,
    title,
    summary,
    ai_summary,
    COALESCE(ai_summary, summary) as display_summary,
    content,
    source,
    author,
    original_url,
    image_url,
    category,
    tags,
    ai_keywords,
    view_count,
    is_featured,
    published_at,
    crawled_at,
    ai_processed,
    ai_processed_at,
    created_at
FROM news
ORDER BY published_at DESC;

COMMENT ON VIEW news_with_ai IS '包含AI概要的新闻视图，优先显示AI概要，如无则显示原摘要';