# IC123 Cloudflare 完整部署指南

## 🚀 快速部署（推荐）

### 一键部署脚本
```bash
# 运行自动部署脚本
chmod +x deploy/cloudflare-deploy.sh
./deploy/cloudflare-deploy.sh
```

## 📋 手动部署步骤

### 前置要求
1. 安装 Node.js 18+
2. 安装 Wrangler CLI: `npm install -g wrangler`
3. 登录 Cloudflare: `wrangler login`

### 步骤1：准备项目
```bash
# 构建前端项目
cd frontend
npm ci
NODE_ENV=production npm run build
```

### 步骤2：创建Cloudflare Pages项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 "Pages" → "Create a project"
3. 连接你的Git仓库
4. 选择 `ic123` 仓库

### 步骤3：配置构建设置
- **Framework preset**: Next.js
- **Build command**: `cd frontend && npm run build`
- **Build output directory**: `frontend/out`
- **Root directory**: `/`

### 步骤4：设置环境变量
在Pages项目设置中添加：
```
NEXT_PUBLIC_API_URL=https://ic123-backend.your-subdomain.workers.dev/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 步骤5：自定义域名（可选）
- 添加自定义域名: `ic123.com`
- 配置DNS记录
- 启用HTTPS

## ⚡ 后端部署到Cloudflare Workers

### 步骤1：安装Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 步骤2：准备后端项目
```bash
cd backend
npm run build
```

### 步骤3：配置环境变量
```bash
# 设置生产环境变量
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

### 步骤4：部署到Workers
```bash
wrangler deploy --env production
```

### 步骤5：验证部署
访问: `https://ic123-backend.your-subdomain.workers.dev/api/health`

## 🔧 部署后配置

### 1. 更新CORS设置
确保Workers的CORS_ORIGIN指向Pages域名：
```bash
wrangler secret put CORS_ORIGIN
# 输入: https://ic123.pages.dev
```

### 2. 配置自定义域名
- Workers: `api.ic123.com`
- Pages: `ic123.com`

### 3. 更新前端API地址
```
NEXT_PUBLIC_API_URL=https://api.ic123.com/api
```

## 📊 性能优化

### Cloudflare Pages
- ✅ 全球CDN分发
- ✅ 自动HTTPS
- ✅ 无限带宽
- ✅ Git自动部署

### Cloudflare Workers
- ✅ 边缘计算
- ✅ 0冷启动
- ✅ 全球分布
- ✅ 自动扩展

## 🔍 监控和分析

### Analytics
在Cloudflare Dashboard中启用：
- Pages Analytics
- Workers Analytics
- Real User Monitoring

### 日志监控
```bash
# 查看Workers日志
wrangler tail
```

## 🚦 CI/CD自动部署

### GitHub Actions配置
创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci && npm run build
      - uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: ic123
          directory: frontend/out

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd backend && npm ci && npm run build
      - run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📈 扩展建议

### 缓存策略
- 静态资源：1年缓存
- API响应：5分钟缓存
- 新闻数据：1小时缓存

### 安全设置
- CSP头部配置
- CSRF保护
- Rate Limiting
- WAF规则

### 备份策略
- 代码：Git版本控制
- 数据库：Supabase自动备份
- 配置：环境变量备份