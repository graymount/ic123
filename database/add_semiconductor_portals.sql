-- 添加半导体行业门户网站到数据库
-- 根据门户网站内容与功能矩阵表格

-- 首先确保"行业门户"分类存在
INSERT INTO categories (name, description, icon, sort_order, is_active) VALUES
('行业门户', '半导体行业权威机构和门户网站', '🌐', 9, true)
ON CONFLICT (name) DO NOTHING;

-- 1. 添加半导体工业协会 (SIA)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('半导体工业协会 (SIA)', 'https://www.semiconductors.org/', 
 '美国半导体工业协会，全球半导体行业的权威组织。提供每日/月度的新闻更新、销售预测和事实数据、政策洞察与倡导、成员公司数据库。是了解全球半导体市场趋势、政策动向和行业统计数据的重要平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '半导体企业高管、政策制定者、行业分析师、投资者、媒体记者', 
 '市场数据查询、政策信息获取、行业趋势分析、成员企业查找、新闻资讯阅读',
 ARRAY['SIA', '半导体工业协会', '行业协会', '市场数据', '政策洞察', '美国', '权威机构']),

-- 2. 添加SEMI
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('SEMI', 'https://www.semi.org/', 
 'SEMI是全球电子制造供应链的行业协会，提供每日更新的行业新闻、市场数据报告、技术社区论坛、活动日历和政策倡导。涵盖半导体、显示器、太阳能光伏等领域，是连接全球电子制造生态系统的重要平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '电子制造业从业者、半导体工程师、设备供应商、技术研发人员、行业专家', 
 '技术交流、市场分析、活动参与、政策了解、供应链信息获取',
 ARRAY['SEMI', '电子制造', '半导体设备', '技术社区', '市场数据', '全球协会', '供应链']),

-- 3. 添加全球半导体联盟 (GSA)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('全球半导体联盟 (GSA)', 'https://www.gsaglobal.org/', 
 '全球半导体联盟，专注于半导体行业的商业网络和市场intelligence。提供财务和公司数据、活动日历、政策倡导、成员录/公司数据库和供应商列表。致力于连接全球半导体生态系统，促进商业合作与发展，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '半导体企业CEO、商务开发人员、投资者、战略规划师、供应链管理者', 
 '商业网络建立、公司信息查询、供应商寻找、投资分析、战略合作',
 ARRAY['GSA', '全球半导体联盟', '商业网络', '公司数据', '供应商列表', '投资分析', '战略合作']),

-- 4. 添加欧洲半导体工业协会 (ESIA)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('欧洲半导体工业协会 (ESIA)', 'https://www.eusemiconductors.eu/', 
 '欧洲半导体工业协会，代表欧洲半导体价值链的利益。定期发布销售数据和市场价格信息、组织行业活动、提供政策洞察与倡导。是了解欧洲半导体市场动态、政策环境和行业发展的权威平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '欧洲半导体企业、政策制定者、市场分析师、投资者、媒体', 
 '欧洲市场分析、政策信息获取、行业活动参与、价格数据查询、政策倡导了解',
 ARRAY['ESIA', '欧洲半导体协会', '欧洲市场', '政策倡导', '价格数据', '行业活动', '市场分析']),

-- 5. 添加中国半导体行业协会 (CSIA)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('中国半导体行业协会 (CSIA)', 'https://www.csia.net.cn/', 
 '中国半导体行业协会，中国半导体产业的权威机构。频繁更新行业研究报告和统计数据、组织行业活动、提供政策洞察与倡导、维护成员企业数据库。是了解中国半导体产业发展、政策动向和市场数据的重要平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '中国半导体企业、政府官员、行业研究员、投资机构、产业分析师', 
 '中国市场分析、政策解读、统计数据查询、行业报告获取、企业信息查找',
 ARRAY['CSIA', '中国半导体协会', '中国市场', '行业研究', '统计数据', '政策解读', '本土协会']),

-- 6. 添加半导体文摘 (Semiconductor Digest)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('半导体文摘 (Semiconductor Digest)', 'https://www.semiconductordigest.com/', 
 '半导体文摘，专业的半导体行业媒体平台。提供每日/月度的新闻更新、深度技术文章和行业评论、活动日历等。专注于半导体技术趋势、市场分析和行业洞察，是半导体从业者获取专业资讯的重要媒体平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '半导体工程师、技术专家、行业分析师、产品经理、研发人员', 
 '技术资讯阅读、行业趋势了解、深度文章学习、专业评论获取、技术发展跟踪',
 ARRAY['Semiconductor Digest', '半导体媒体', '技术文章', '行业评论', '专业资讯', '技术趋势', '媒体平台']),

-- 7. 添加Stratview Research
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('Stratview Research', 'https://www.stratviewresearch.com/', 
 'Stratview Research是专业的市场研究和咨询公司，专注于半导体和相关行业。提供预测性市场分析、行业动态研究和定制化咨询服务。以深度的市场洞察和准确的预测分析见长，主要提供付费的专业研究报告和咨询服务。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '投资者、战略规划师、市场分析师、企业高管、咨询顾问', 
 '市场预测分析、行业研究报告、投资决策支持、战略规划参考、竞争情报获取',
 ARRAY['Stratview Research', '市场研究', '行业咨询', '预测分析', '付费报告', '投资分析', '战略咨询']),

-- 8. 添加美国国家半导体技术中心 (NSTC)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('美国国家半导体技术中心 (NSTC)', 'https://www.nist.gov/semiconductors/', 
 '美国国家半导体技术中心，隶属于美国国家标准与技术研究院(NIST)。定期发布研发计划和技术路线图、提供政策信息和技术标准。专注于半导体技术的研发规划、标准制定和政策支持，是了解美国半导体技术发展战略的官方平台，内容主要免费。',
 (SELECT id FROM categories WHERE name = '行业门户'), 
 '政府官员、研发机构、技术标准制定者、学术研究人员、政策分析师', 
 '技术路线图查询、研发规划了解、政策信息获取、技术标准参考、战略规划制定',
 ARRAY['NSTC', '美国政府', '技术中心', '研发规划', '技术标准', '政策支持', '官方机构'])
ON CONFLICT (name) DO NOTHING;

-- 验证添加结果
SELECT 
    w.name as website_name,
    w.url,
    c.name as category_name,
    array_length(w.tags, 1) as tag_count
FROM websites w
JOIN categories c ON w.category_id = c.id
WHERE c.name = '行业门户'
ORDER BY w.name; 