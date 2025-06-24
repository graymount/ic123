-- 添加ASML网站到数据库
-- ASML是全球领先的光刻设备制造商，为半导体制造提供关键设备

INSERT INTO websites (
    name,
    url,
    description,
    category_id,
    target_audience,
    use_case,
    tags,
    rating
) VALUES (
    'ASML',
    'https://www.asml.com',
    'ASML是全球领先的光刻设备制造商，为半导体制造商提供先进的光刻系统、计量和检测解决方案，是半导体制造工艺链中的关键设备供应商。',
    (SELECT id FROM categories WHERE name = '设计工具'),
    'IC制造商、晶圆厂、半导体设备工程师、工艺工程师',
    '了解最新光刻技术、EUV设备信息、半导体制造设备采购、技术支持和服务',
    ARRAY['光刻设备', 'EUV', '半导体制造', '工艺设备', 'DUV', '计量检测'],
    4.8
);

-- 添加评论说明此次添加的背景
COMMENT ON TABLE websites IS '网站目录表 - 最新添加ASML光刻设备制造商官网';