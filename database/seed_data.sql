-- IC123 初始数据插入脚本
-- 用于填充基础分类和示例数据

-- 插入分类数据
INSERT INTO categories (name, description, icon, sort_order) VALUES
('行业门户', 'IC行业综合门户网站', 'globe', 1),
('设计工具', 'EDA工具和设计平台', 'cpu', 2),
('招聘求职', 'IC行业人才招聘平台', 'briefcase', 3),
('社区论坛', '技术交流和讨论社区', 'users', 4),
('供应链', '元器件采购和供应链服务', 'truck', 5),
('投资机构', 'IC行业投资和孵化机构', 'trending-up', 6),
('政策法规', '行业政策和标准规范', 'file-text', 7);

-- 插入示例网站数据
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('中国半导体行业协会', 'http://www.csia.net.cn/', '中国半导体行业权威官方网站，发布行业政策、统计数据和发展动态', 
 (SELECT id FROM categories WHERE name = '行业门户'), 
 'IC行业从业者、投资者、政策制定者', 
 '了解行业政策、获取权威数据、参与行业活动',
 ARRAY['官方', '权威', '政策', '数据']),

('集微网', 'https://www.jimwei.com/', 'IC行业专业媒体平台，提供产业新闻、深度分析和市场报告',
 (SELECT id FROM categories WHERE name = '行业门户'),
 'IC从业者、投资者、媒体工作者',
 '获取行业资讯、市场分析、企业动态',
 ARRAY['媒体', '新闻', '分析', '报告']),

('芯思想', 'https://www.xinsiwei.com/', 'IC产业链深度报道和分析平台',
 (SELECT id FROM categories WHERE name = '行业门户'),
 'IC行业高管、投资者、分析师',
 '深度行业分析、企业研究、投资参考',
 ARRAY['深度', '分析', '企业', '投资']),

('Cadence', 'https://www.cadence.com/', '全球领先的EDA工具提供商',
 (SELECT id FROM categories WHERE name = '设计工具'),
 'IC设计工程师、系统工程师',
 '芯片设计、仿真验证、系统级设计',
 ARRAY['EDA', '设计', '仿真', '验证']),

('Synopsys', 'https://www.synopsys.com/', '电子设计自动化和IP解决方案领导者',
 (SELECT id FROM categories WHERE name = '设计工具'),
 'IC设计工程师、验证工程师',
 'IC设计、验证、IP授权、安全测试',
 ARRAY['EDA', 'IP', '设计', '安全']),


('芯片人才网', 'https://www.icjob.com/', 'IC行业专业招聘平台',
 (SELECT id FROM categories WHERE name = '招聘求职'),
 'IC从业者、求职者、HR',
 '求职招聘、薪资参考、行业人才流动',
 ARRAY['招聘', '求职', '人才', '薪资']),

('电子工程世界', 'https://www.eeworld.com.cn/', '电子工程师技术交流社区',
 (SELECT id FROM categories WHERE name = '社区论坛'),
 '电子工程师、技术爱好者、学生',
 '技术交流、问题解答、资料分享',
 ARRAY['社区', '技术', '交流', '资料']);

-- 插入示例公众号数据
INSERT INTO wechat_accounts (name, wechat_id, description, positioning, target_audience, operator_background, tags) VALUES
('芯东西', 'aichip001', '专注人工智能芯片产业报道', '智能芯片第一媒体', 
 'AI芯片从业者、投资者', '资深科技媒体团队，专注AI芯片领域多年', 
 ARRAY['AI芯片', '人工智能', '媒体', '深度报道']),

('芯师爷', 'xinshiye', 'IC产业链深度分析和投资研究', '芯片产业投资风向标',
 'IC投资者、分析师、高管', '投资机构背景，专业IC产业分析师团队',
 ARRAY['投资', '分析', '产业链', '研究']),

('半导体行业观察', 'icbank', '半导体产业全景观察和分析', '半导体产业观察员',
 '半导体从业者、投资者、媒体', '半导体行业资深从业者和分析师',
 ARRAY['半导体', '观察', '分析', '产业']),

('集微网', 'laoyaoba', 'IC产业链新闻和深度报道', 'IC产业第一媒体',
 'IC全产业链从业者', '专业IC媒体团队',
 ARRAY['IC', '新闻', '媒体', '产业链']),

('芯片揭秘', 'ICdecryption', '芯片技术解析和产业分析', '芯片技术科普专家',
 '技术工程师、产品经理、技术爱好者', '芯片设计和制造领域专家',
 ARRAY['技术', '科普', '芯片', '解析']);

-- 插入示例新闻数据
INSERT INTO news (title, summary, source, original_url, category, tags, published_at) VALUES
('国产芯片迎来新突破，7nm工艺实现量产', 
 '国内某芯片制造企业宣布其7nm工艺正式投入量产，这标志着国产芯片在先进制程方面取得重大进展。',
 '芯思想', 'https://example.com/news1', '制造工艺', 
 ARRAY['7nm', '量产', '国产芯片', '制造'], 
 NOW() - INTERVAL '1 day'),

('AI芯片市场预计2025年达到500亿美元', 
 '根据最新市场研究报告，全球AI芯片市场规模预计在2025年达到500亿美元，年复合增长率超过30%。',
 '集微网', 'https://example.com/news2', '市场分析',
 ARRAY['AI芯片', '市场', '预测', '增长'],
 NOW() - INTERVAL '2 days'),

('新一代EDA工具发布，设计效率提升50%',
 '某EDA厂商发布新一代芯片设计工具，采用AI算法优化设计流程，设计效率相比传统工具提升50%。',
 '电子工程世界', 'https://example.com/news3', '设计工具',
 ARRAY['EDA', '设计', 'AI', '效率'],
 NOW() - INTERVAL '3 days'),

('半导体设备国产化率持续提升',
 '2024年国产半导体设备在国内市场的占有率达到35%，相比去年同期提升10个百分点。',
 '中国半导体行业协会', 'https://example.com/news4', '设备',
 ARRAY['半导体设备', '国产化', '市场占有率'],
 NOW() - INTERVAL '4 days'),

('车规级芯片需求激增，供应链面临挑战',
 '随着新能源汽车市场快速发展，车规级芯片需求激增，但供应链仍面临技术和产能双重挑战。',
 '芯东西', 'https://example.com/news5', '汽车电子',
 ARRAY['车规级', '芯片', '新能源汽车', '供应链'],
 NOW() - INTERVAL '5 days');