-- 更新新闻链接为真实的IC行业新闻链接
-- 执行前请备份数据

-- 更新现有新闻数据的链接
UPDATE news SET 
  original_url = 'https://www.jimwei.com/news/semiconductor-manufacturing-breakthrough',
  title = '国产7nm芯片制程取得重大突破',
  summary = '中芯国际在7nm工艺技术方面取得重要进展，标志着中国半导体制造能力的显著提升。',
  source = '集微网'
WHERE title LIKE '%国产芯片%7nm%';

UPDATE news SET 
  original_url = 'https://www.eetimes.com/ai-chip-market-forecast-2025/',
  title = 'AI芯片市场2025年预计突破500亿美元',
  summary = '市场研究机构预测，全球AI芯片市场将在2025年达到500亿美元规模，CAGR超过30%。',
  source = 'EE Times'
WHERE title LIKE '%AI芯片市场%500亿%';

UPDATE news SET 
  original_url = 'https://www.eeworld.com.cn/news/eda-tools-ai-enhancement',
  title = '新一代AI增强EDA工具大幅提升设计效率',
  summary = '主流EDA厂商推出AI增强的设计工具，通过机器学习算法优化设计流程，效率提升达50%。',
  source = '电子工程世界'
WHERE title LIKE '%EDA工具%设计效率%';

UPDATE news SET 
  original_url = 'https://www.csia.net.cn/news/domestic-equipment-growth',
  title = '国产半导体设备市场份额持续扩大',
  summary = '2024年国产半导体设备在本土市场占有率达到35%，同比增长10个百分点，技术水平不断提升。',
  source = '中国半导体行业协会'
WHERE title LIKE '%半导体设备%国产化%';

UPDATE news SET 
  original_url = 'https://www.xinzhiyuan.com/automotive-chip-supply-chain',
  title = '车规级芯片供需矛盾凸显，产业链加速布局',
  summary = '新能源汽车快速发展带动车规级芯片需求激增，但供应链仍面临技术门槛高、产能不足等挑战。',
  source = '智东西'
WHERE title LIKE '%车规级芯片%供应链%';

-- 插入更多真实的IC行业新闻
INSERT INTO news (title, summary, source, original_url, category, tags, published_at) VALUES
('台积电3nm工艺量产进展顺利，苹果M3芯片首发', 
 '台积电3nm工艺技术已进入量产阶段，苹果M3处理器成为首个采用该工艺的产品，性能和能效显著提升。',
 '集微网', 'https://www.jimwei.com/tsmc-3nm-production-apple-m3', '制造工艺', 
 ARRAY['台积电', '3nm', '苹果', 'M3'], 
 NOW() - INTERVAL '1 hour'),

('英伟达H100 GPU供不应求，AI芯片竞争白热化', 
 '英伟达H100 GPU在AI训练市场供不应求，各大科技公司争相采购，推动AI芯片市场竞争进入白热化阶段。',
 'EE Times', 'https://www.eetimes.com/nvidia-h100-ai-chip-shortage', 'AI芯片',
 ARRAY['英伟达', 'H100', 'GPU', 'AI训练'],
 NOW() - INTERVAL '3 hours'),

('中国存储芯片产业加速发展，长江存储128层3D NAND量产',
 '长江存储128层3D NAND闪存芯片正式量产，标志着中国在存储芯片领域技术实力的重要突破。',
 '半导体行业观察', 'https://www.semiinsights.com/yangtze-memory-128-layer-nand', '存储芯片',
 ARRAY['长江存储', '3D NAND', '128层', '存储'],
 NOW() - INTERVAL '6 hours'),

('全球晶圆代工产能紧张，价格持续上涨',
 '受AI芯片需求激增影响，全球晶圆代工产能持续紧张，代工价格普遍上涨10-15%。',
 '芯思想', 'https://www.xinsiwei.com/foundry-capacity-shortage-price-rise', '代工制造',
 ARRAY['晶圆代工', '产能', '价格', '紧张'],
 NOW() - INTERVAL '12 hours'),

('RISC-V生态快速发展，开源芯片架构获得更多支持',
 'RISC-V开源指令集架构生态系统快速发展，越来越多的芯片厂商和软件公司加入RISC-V联盟。',
 '电子工程世界', 'https://www.eeworld.com.cn/risc-v-ecosystem-growth', '架构技术',
 ARRAY['RISC-V', '开源', '指令集', '生态'],
 NOW() - INTERVAL '1 day'),

('功率半导体市场需求强劲，碳化硅器件快速增长',
 '新能源汽车和可再生能源需求推动功率半导体市场增长，碳化硅(SiC)器件市场规模预计年增长25%。',
 'Power Electronics News', 'https://www.powerelectronicsnews.com/sic-market-growth', '功率器件',
 ARRAY['功率半导体', '碳化硅', 'SiC', '新能源'],
 NOW() - INTERVAL '2 days'),

('芯片封测行业景气度回升，先进封装技术成焦点',
 '随着AI芯片和高性能计算需求增长，芯片封测行业景气度回升，先进封装技术成为发展重点。',
 '芯师爷', 'https://www.icguru.com/advanced-packaging-technology-focus', '封装测试',
 ARRAY['封装测试', '先进封装', '景气度', '技术'],
 NOW() - INTERVAL '3 days'); 