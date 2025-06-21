# IC123 数据库配置

## 文件说明

- `schema.sql` - 数据库表结构定义
- `seed_data.sql` - 初始化示例数据
- `rls_policies.sql` - Supabase行级安全策略配置

## Supabase 配置步骤

### 1. 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录项目信息：
   - Project URL: `https://your-project-id.supabase.co`
   - API Key (anon): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - API Key (service_role): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2. 执行数据库脚本
在 Supabase Dashboard 的 SQL Editor 中依次执行：

```sql
-- 1. 创建表结构
-- 复制 schema.sql 内容并执行

-- 2. 插入初始数据
-- 复制 seed_data.sql 内容并执行

-- 3. 配置安全策略
-- 复制 rls_policies.sql 内容并执行
```

### 3. 环境变量配置
创建 `.env` 文件：

```bash
# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 应用配置
NODE_ENV=development
PORT=3000
```

## 数据表结构

### 核心表
- `categories` - 网站分类
- `websites` - IC相关网站
- `wechat_accounts` - 微信公众号
- `news` - 行业新闻

### 辅助表
- `user_feedback` - 用户反馈
- `visit_stats` - 访问统计

## API 端点设计

### 公开接口
- `GET /api/categories` - 获取分类列表
- `GET /api/websites` - 获取网站列表
- `GET /api/websites/:categoryId` - 按分类获取网站
- `GET /api/wechat` - 获取公众号列表
- `GET /api/news` - 获取新闻列表
- `GET /api/search` - 搜索内容

### 管理接口 (需要认证)
- `POST /api/admin/websites` - 添加网站
- `PUT /api/admin/websites/:id` - 更新网站
- `DELETE /api/admin/websites/:id` - 删除网站
- `GET /api/admin/feedback` - 获取用户反馈
- `GET /api/admin/stats` - 获取访问统计

## 数据安全

- 启用了 Row Level Security (RLS)
- 公开内容允许匿名访问
- 管理功能需要认证
- 敏感操作记录日志

## 性能优化

- 关键字段添加了索引
- 使用视图优化常用查询
- 支持标签和全文搜索
- 访问统计异步记录