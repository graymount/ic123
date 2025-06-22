-- 修正公司分类错误
-- 将世芯电子和巨有科技从"设计工具"分类改为"芯片设计"分类

-- 更新世芯电子和巨有科技的分类
UPDATE websites 
SET category_id = (SELECT id FROM categories WHERE name = '芯片设计')
WHERE name IN ('世芯电子 (Alchip Technologies)', '巨有科技 (Global UniChip Corp.)');

-- 验证更新结果
SELECT 
    w.name,
    c.name as category_name
FROM websites w
JOIN categories c ON w.category_id = c.id
WHERE w.name IN ('世芯电子 (Alchip Technologies)', '巨有科技 (Global UniChip Corp.)'); 