-- IC123 示例数据
-- 在Supabase SQL Editor中执行此脚本

-- 首先修复缺少的字段
ALTER TABLE wechat_accounts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 创建缺少的RPC函数
CREATE OR REPLACE FUNCTION increment_wechat_view_count(wechat_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE wechat_accounts SET view_count = view_count + 1 WHERE id = wechat_id;
END;
$$ LANGUAGE plpgsql;

-- 插入分类数据
INSERT INTO categories (name, description, icon, sort_order) VALUES
('芯片设计', 'IC设计、EDA工具、IP核等相关网站', 'Cpu', 1),
('制造封测', '晶圆制造、封装测试相关网站', 'Factory', 2),
('设备材料', '半导体设备、材料供应商网站', 'Wrench', 3),
('市场分析', '行业分析、市场研究机构网站', 'TrendingUp', 4),
('技术社区', '技术论坛、开发者社区', 'Users', 5),
('新闻媒体', 'IC行业新闻、媒体平台', 'Newspaper', 6);

-- 插入网站数据
INSERT INTO websites (name, url, description, category_id, target_audience, visit_count, rating, tags) VALUES
('Cadence', 'https://www.cadence.com', '全球领先的EDA工具提供商，提供IC设计、验证和制造解决方案', 
 (SELECT id FROM categories WHERE name = '芯片设计'), 'IC设计工程师', 156, 4.5, ARRAY['EDA', '设计工具', '验证']),

('Synopsys', 'https://www.synopsys.com', '业界知名的EDA和IP解决方案提供商', 
 (SELECT id FROM categories WHERE name = '芯片设计'), 'IC设计工程师', 142, 4.7, ARRAY['EDA', 'IP核', '仿真']),

('台积电', 'https://www.tsmc.com', '全球最大的晶圆代工厂，提供先进制程技术', 
 (SELECT id FROM categories WHERE name = '制造封测'), '芯片制造商', 298, 4.8, ARRAY['晶圆代工', '先进制程', '制造']),

('Applied Materials', 'https://www.appliedmaterials.com', '半导体设备和服务的全球领导者', 
 (SELECT id FROM categories WHERE name = '设备材料'), '设备工程师', 89, 4.3, ARRAY['设备', '材料', '制造']),

('IC Insights', 'https://www.icinsights.com', '半导体市场研究和分析机构', 
 (SELECT id FROM categories WHERE name = '市场分析'), '市场分析师', 67, 4.2, ARRAY['市场研究', '分析报告', '趋势']),

('EETimes', 'https://www.eetimes.com', '电子工程技术新闻和分析', 
 (SELECT id FROM categories WHERE name = '新闻媒体'), '工程师', 234, 4.4, ARRAY['新闻', '技术', '分析']);

-- 插入新闻数据
INSERT INTO news (title, summary, source, author, original_url, category, view_count, is_featured, published_at) VALUES
('台积电3nm工艺技术取得突破性进展', '台积电宣布其3nm制程技术在良率和性能方面取得重大突破，预计将在明年大规模量产', 'EETimes中国', '张明', 'https://www.eetimes.com/tsmc-3nm-breakthrough', '制造工艺', 1234, true, NOW() - INTERVAL '2 hours'),

('新一代EDA工具助力AI芯片设计', 'Cadence发布专门针对AI芯片设计的新EDA工具套件，大幅提升设计效率', '电子工程世界', '李华', 'https://www.eeworldnews.com/eda-ai-chip-design', '设计工具', 856, false, NOW() - INTERVAL '5 hours'),

('全球半导体市场预计2024年恢复增长', 'IC Insights最新报告显示，全球半导体市场在经历调整后，预计2024年将恢复增长', '半导体行业观察', '王强', 'https://www.semiinsights.com/market-recovery-2024', '市场分析', 692, true, NOW() - INTERVAL '1 day'),

('国产EDA工具在逻辑综合领域取得突破', '某知名国产EDA公司在逻辑综合算法方面取得重要突破，性能接近国际先进水平', '集微网', '刘敏', 'https://www.jimicrosoft.com/domestic-eda-breakthrough', '国产化', 445, false, NOW() - INTERVAL '2 days'),

('RISC-V生态系统持续扩大', 'RISC-V International宣布新增多家重要成员，开源指令集架构生态持续壮大', 'RISC-V国际基金会', '陈涛', 'https://riscv.org/ecosystem-expansion', '开源硬件', 334, false, NOW() - INTERVAL '3 days');

-- 插入微信公众号数据
INSERT INTO wechat_accounts (name, wechat_id, description, positioning, target_audience, is_verified, follower_count, view_count, tags) VALUES
('半导体行业观察', 'icbank', '专注半导体产业链深度报道和分析的专业媒体平台', '最具影响力的半导体行业媒体', 'IC从业者', true, 180000, 2456, ARRAY['行业分析', '深度报道', '产业链']),

('芯师爷', 'xinshiye', '提供IC设计实战经验分享和技术交流的平台', '工程师的技术成长伙伴', 'IC设计工程师', true, 95000, 1834, ARRAY['技术分享', '实战经验', '工程师']),

('集微网', 'jiweinet', '中国领先的半导体产业媒体和分析平台', '连接全球半导体产业', '产业人士', true, 220000, 3267, ARRAY['产业新闻', '市场分析', '投资']),

('EDA365', 'eda365', 'IC设计和EDA工具使用交流社区', 'EDA工程师的专业社区', 'EDA工程师', false, 45000, 892, ARRAY['EDA工具', '设计技巧', '社区']),

('与非网', 'eefocus', '电子工程师技术社区和资讯平台', '电子工程师的技术家园', '电子工程师', true, 156000, 2145, ARRAY['电子技术', '工程师', '资讯']);

-- 插入示例反馈数据
INSERT INTO user_feedback (type, title, content, status) VALUES
('suggestion', '希望增加更多国产EDA工具网站', '建议添加华大九天、概伦电子等国产EDA厂商的官网链接', 'reviewed'),
('website', '推荐添加Mentor Graphics网站', 'Mentor Graphics是重要的EDA工具提供商，建议添加到芯片设计分类中', 'pending'),
('bug', '搜索功能无法正常工作', '在搜索框输入关键词后，没有返回相关结果', 'pending');

-- 插入一些访问统计示例数据
INSERT INTO visit_stats (resource_type, resource_id, visited_at) 
SELECT 'website', w.id, NOW() - (random() * INTERVAL '30 days')
FROM websites w, generate_series(1, 10);

INSERT INTO visit_stats (resource_type, resource_id, visited_at) 
SELECT 'news', n.id, NOW() - (random() * INTERVAL '7 days')
FROM news n, generate_series(1, 15);