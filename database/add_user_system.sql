-- 用户系统和评论点赞功能数据库表
-- 用于IC123项目的用户认证、评论和点赞功能

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt hash
  username VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  is_verified BOOLEAN DEFAULT false, -- 邮箱验证状态
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 邮箱验证表
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户会话表（用于JWT替代方案或更精细的会话管理）
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('news')), -- 目前只支持新闻评论
  resource_id UUID NOT NULL, -- 关联到news表的id
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- 支持回复评论
  is_deleted BOOLEAN DEFAULT false, -- 软删除
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_type VARCHAR(20) NOT NULL CHECK (resource_type IN ('news', 'comment')),
  resource_id UUID NOT NULL, -- 关联到news.id或comments.id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保用户对同一资源只能点赞一次
  UNIQUE(user_id, resource_type, resource_id)
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);

CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX idx_email_verifications_token ON email_verifications(token);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_resource ON comments(resource_type, resource_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_resource ON likes(resource_type, resource_id);

-- 为新表添加更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数用于更新点赞数
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 新增点赞
        IF NEW.resource_type = 'comment' THEN
            UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.resource_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- 取消点赞
        IF OLD.resource_type = 'comment' THEN
            UPDATE comments SET like_count = like_count - 1 WHERE id = OLD.resource_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器自动更新评论点赞数
CREATE TRIGGER trigger_update_comment_like_count
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- 创建RPC函数用于获取带用户信息的评论
CREATE OR REPLACE FUNCTION get_comments_with_user_info(target_resource_type TEXT, target_resource_id UUID)
RETURNS TABLE (
    id UUID,
    content TEXT,
    parent_id UUID,
    like_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    avatar_url VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.content,
        c.parent_id,
        c.like_count,
        c.created_at,
        c.updated_at,
        u.id as user_id,
        u.username,
        u.display_name,
        u.avatar_url
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.resource_type = target_resource_type 
    AND c.resource_id = target_resource_id
    AND c.is_deleted = false
    ORDER BY c.created_at ASC;
END;
$$ LANGUAGE plpgsql;