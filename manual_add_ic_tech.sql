
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
