-- IC123 数据库初始化脚本
-- Supabase PostgreSQL Schema

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- 图标类名或路径
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 网站表
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  target_audience VARCHAR(200),
  use_case TEXT, -- 典型使用场景
  is_active BOOLEAN DEFAULT true,
  visit_count INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0, -- 评分 0-5
  tags TEXT[], -- 标签数组
  screenshot_url VARCHAR(500), -- 网站截图
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 公众号表
CREATE TABLE wechat_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  wechat_id VARCHAR(100), -- 微信号
  description TEXT NOT NULL,
  positioning TEXT, -- 一句话定位
  target_audience VARCHAR(200),
  operator_background TEXT,
  qr_code_url VARCHAR(500), -- 二维码图片URL
  is_verified BOOLEAN DEFAULT false, -- 是否认证
  follower_count INTEGER, -- 粉丝数量（如果可获取）
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 新闻表
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(300) NOT NULL,
  summary TEXT,
  content TEXT, -- 完整内容（可选）
  source VARCHAR(100) NOT NULL,
  author VARCHAR(100),
  original_url VARCHAR(500) NOT NULL,
  image_url VARCHAR(500), -- 配图URL
  category VARCHAR(50), -- 新闻分类
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false, -- 是否推荐
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户反馈表（用于收集网站推荐等）
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('website', 'wechat', 'bug', 'suggestion')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  contact_info VARCHAR(200), -- 联系方式（可选）
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 访问统计表
CREATE TABLE visit_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('website', 'news', 'wechat')),
  resource_id UUID NOT NULL,
  visitor_ip INET,
  user_agent TEXT,
  referer VARCHAR(500),
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_websites_category ON websites(category_id);
CREATE INDEX idx_websites_active ON websites(is_active);
CREATE INDEX idx_websites_tags ON websites USING GIN(tags);
CREATE INDEX idx_news_published ON news(published_at DESC);
CREATE INDEX idx_news_source ON news(source);
CREATE INDEX idx_news_tags ON news USING GIN(tags);
CREATE INDEX idx_wechat_active ON wechat_accounts(is_active);
CREATE INDEX idx_visit_stats_resource ON visit_stats(resource_type, resource_id);
CREATE INDEX idx_visit_stats_time ON visit_stats(visited_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加自动更新时间戳触发器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wechat_accounts_updated_at BEFORE UPDATE ON wechat_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_feedback_updated_at BEFORE UPDATE ON user_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建RPC函数用于计数器更新
CREATE OR REPLACE FUNCTION increment_website_visit_count(website_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE websites SET visit_count = visit_count + 1 WHERE id = website_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_news_view_count(news_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE news SET view_count = view_count + 1 WHERE id = news_id;
END;
$$ LANGUAGE plpgsql;