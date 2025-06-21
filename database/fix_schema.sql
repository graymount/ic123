-- 修复缺少的字段
ALTER TABLE wechat_accounts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 创建缺少的RPC函数
CREATE OR REPLACE FUNCTION increment_wechat_view_count(wechat_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE wechat_accounts SET view_count = view_count + 1 WHERE id = wechat_id;
END;
$$ LANGUAGE plpgsql;