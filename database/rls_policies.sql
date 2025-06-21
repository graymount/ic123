-- Supabase Row Level Security (RLS) 策略配置
-- 用于控制数据访问权限

-- 启用RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE wechat_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_stats ENABLE ROW LEVEL SECURITY;

-- 公开读取策略 - 所有用户都可以读取已激活的内容
CREATE POLICY "公开访问分类" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "公开访问网站" ON websites FOR SELECT USING (is_active = true);
CREATE POLICY "公开访问公众号" ON wechat_accounts FOR SELECT USING (is_active = true);
CREATE POLICY "公开访问新闻" ON news FOR SELECT USING (true);

-- 用户反馈 - 任何人都可以提交反馈
CREATE POLICY "提交用户反馈" ON user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "查看自己的反馈" ON user_feedback FOR SELECT USING (true);

-- 访问统计 - 允许插入访问记录
CREATE POLICY "记录访问统计" ON visit_stats FOR INSERT WITH CHECK (true);

-- 管理员策略 - 需要创建自定义角色
-- 注意：在实际使用中，你需要根据具体的用户管理方案调整这些策略

-- 创建管理员角色检查函数
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- 这里需要根据你的用户管理系统调整
  -- 例如检查 auth.jwt() 中的角色信息
  -- 或者从用户表中查询角色
  RETURN false; -- 暂时返回false，需要根据实际情况修改
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理员完全访问策略（需要在实现用户系统后启用）
-- CREATE POLICY "管理员完全访问分类" ON categories FOR ALL USING (is_admin());
-- CREATE POLICY "管理员完全访问网站" ON websites FOR ALL USING (is_admin());
-- CREATE POLICY "管理员完全访问公众号" ON wechat_accounts FOR ALL USING (is_admin());
-- CREATE POLICY "管理员完全访问新闻" ON news FOR ALL USING (is_admin());
-- CREATE POLICY "管理员管理用户反馈" ON user_feedback FOR ALL USING (is_admin());

-- 创建视图用于常用数据查询
CREATE OR REPLACE VIEW active_websites_with_category AS
SELECT 
  w.id,
  w.name,
  w.url,
  w.description,
  w.target_audience,
  w.use_case,
  w.visit_count,
  w.rating,
  w.tags,
  w.created_at,
  c.name as category_name,
  c.icon as category_icon
FROM websites w
LEFT JOIN categories c ON w.category_id = c.id
WHERE w.is_active = true AND (c.is_active = true OR c.is_active IS NULL)
ORDER BY c.sort_order, w.name;

CREATE OR REPLACE VIEW latest_news AS
SELECT 
  id,
  title,
  summary,
  source,
  original_url,
  image_url,
  category,
  tags,
  view_count,
  is_featured,
  published_at,
  created_at
FROM news
ORDER BY published_at DESC
LIMIT 50;

CREATE OR REPLACE VIEW featured_content AS
SELECT 
  'news' as content_type,
  id,
  title as name,
  summary as description,
  original_url as url,
  tags,
  published_at as date
FROM news 
WHERE is_featured = true
UNION ALL
SELECT 
  'website' as content_type,
  id,
  name,
  description,
  url,
  tags,
  created_at as date
FROM websites 
WHERE is_active = true AND rating >= 4.0
ORDER BY date DESC;

-- 为视图添加访问策略
GRANT SELECT ON active_websites_with_category TO anon, authenticated;
GRANT SELECT ON latest_news TO anon, authenticated;
GRANT SELECT ON featured_content TO anon, authenticated;