-- 添加EDA公司到网站数据库
-- 以下是来自用户文章中提到的中国EDA公司

-- 插入华大九天 (Empyrean Technology)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('华大九天 (Empyrean Technology)', 'https://www.empyrean.com.cn/', 
 '中国国产EDA领域的领军企业，也是目前国内唯一能够提供接近全流程EDA工具系统的厂商。提供模拟/混合信号设计、平板显示（FPD）设计、数字电路设计、晶圆制造EDA、先进封装设计等全流程EDA工具系统。', 
 (SELECT id FROM categories WHERE name = '设计工具'), 
 'IC设计工程师、模拟电路设计师、数字电路设计师、EDA工具用户', 
 '芯片设计、电路仿真、物理验证、版图设计、先进封装设计',
 ARRAY['EDA', '华大九天', '国产EDA', '模拟设计', '数字设计', '全流程'])
ON CONFLICT (name) DO NOTHING;

-- 插入概伦电子 (Primarius Technologies) 
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('概伦电子 (Primarius Technologies)', 'https://www.primarius-tech.com/', 
 '中国首家在科创板上市的EDA公司，致力于提供覆盖集成电路设计和制造的全流程EDA解决方案。产品包括制造类EDA、泛模拟设计类EDA、数字设计类EDA和测试系统，NanoSpice™仿真器已获得台积电3nm工艺认证。', 
 (SELECT id FROM categories WHERE name = '设计工具'), 
 'IC设计工程师、晶圆制造工程师、测试工程师、EDA工具用户', 
 'SPICE仿真、电路设计、PDK开发、标准单元库特征化、测试系统',
 ARRAY['EDA', '概伦电子', 'SPICE仿真', '制造EDA', '测试系统', '科创板'])
ON CONFLICT (name) DO NOTHING;

-- 插入广立微 (Semitronix)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('广立微 (Semitronix)', 'https://www.semitronix.com/', 
 '专注于芯片良率分析和测试芯片（Test Chip）设计的EDA公司，已成功登陆科创板。公司的核心产品包括芯片良率分析系统，并已进入三星供应链。', 
 (SELECT id FROM categories WHERE name = '设计工具'), 
 'IC设计工程师、良率分析工程师、测试工程师、晶圆制造工程师', 
 '芯片良率分析、测试芯片设计、制造工艺优化',
 ARRAY['EDA', '广立微', '良率分析', 'Test Chip', '三星供应链', '科创板'])
ON CONFLICT (name) DO NOTHING;

-- 插入芯和半导体 (Xpeedic Technology)  
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('芯和半导体 (Xpeedic Technology)', 'https://www.xpeedic.com/', 
 '专注于工业设计和仿真，特别是电磁仿真领域的EDA公司。拥有对标国际巨头的从芯片到系统的仿真产品，在电磁仿真、热力仿真方面具有专长。已被华大九天收购，旨在构建更完整的产品链条和生态系统。', 
 (SELECT id FROM categories WHERE name = '设计工具'), 
 'IC设计工程师、系统设计工程师、电磁仿真工程师、热分析工程师', 
 '电磁仿真、热力仿真、信号完整性分析、电源完整性分析、系统级仿真',
 ARRAY['EDA', '芯和半导体', '电磁仿真', '热仿真', '系统仿真', '华为投资'])
ON CONFLICT (name) DO NOTHING;

-- 插入芯华章 (X-EPIC)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('芯华章 (X-EPIC)', 'https://www.x-epic.com/', 
 '聚集全球EDA行业精英，致力于构建智能化的电子设计平台。公司成立于2020年，提供全面覆盖数字芯片验证需求的七大产品系列，包括硬件仿真系统、FPGA原型验证系统、智能场景验证、形式验证、逻辑仿真、系统调试以及验证云。', 
 (SELECT id FROM categories WHERE name = '设计工具'), 
 'IC设计工程师、验证工程师、系统工程师、EDA工具用户', 
 '数字芯片验证、硬件仿真、FPGA原型验证、形式验证、逻辑仿真、系统调试',
 ARRAY['EDA', '芯华章', '数字验证', '硬件仿真', 'FPGA验证', '华为投资'])
ON CONFLICT (name) DO NOTHING; 

-- 插入世芯电子 (Alchip Technologies)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('世芯电子 (Alchip Technologies)', 'https://www.alchip.com/', 
 '专业的ASIC交钥匙解决方案提供商，提供从SoC前端设计到物理后端设计的全套ASIC设计服务。作为台积电DCA合作伙伴，专注于AI、HPC、数据中心和网络等应用的先进SoC解决方案。在先进工艺节点（3nm、5nm、7nm）和2.5D高级封装方面具有专业知识，提供IP集成和验证、可测试性设计（DFT）、先进封装服务和质量保证等全方位服务。', 
 (SELECT id FROM categories WHERE name = '芯片设计'), 
 'IC设计工程师、SoC设计工程师、系统工程师、AI芯片开发者、HPC工程师', 
 'ASIC设计、SoC前端设计、物理后端设计、低功耗设计、高性能设计、DFT设计、先进封装',
 ARRAY['ASIC', '世芯电子', 'SoC设计', '台积电DCA', 'AI芯片', 'HPC', '先进工艺'])
ON CONFLICT (name) DO NOTHING;

-- 插入巨有科技 (Global UniChip Corp.)
INSERT INTO websites (name, url, description, category_id, target_audience, use_case, tags) VALUES
('巨有科技 (Global UniChip Corp.)', 'https://www.guc-asic.com/', 
 '先进ASIC服务的市场领导者，为半导体行业提供领先的IC实现和SoC制造服务。作为台积电最大的单一股东和战略合作伙伴，提供从spec-in到SoC集成、物理实现、先进封装技术、交钥匙制造的全套服务。拥有世界级的HBM（高带宽存储器）和GLink（die-to-die互连）IP，在AI、HPC、5G/网络、SSD等领域引领ASIC服务市场，提供最具竞争力的PPA（功耗、性能和面积）设计解决方案。', 
 (SELECT id FROM categories WHERE name = '芯片设计'), 
 'IC设计工程师、ASIC设计工程师、HPC工程师、AI芯片开发者、5G网络工程师、存储工程师', 
 'ASIC服务、SoC集成、物理实现、HBM设计、先进封装、CoWoS、InFO、SoIC、die-to-die互连',
 ARRAY['ASIC', '巨有科技', 'HBM', 'GLink', '台积电合作', 'AI', 'HPC', '5G', '先进封装'])
ON CONFLICT (name) DO NOTHING; 