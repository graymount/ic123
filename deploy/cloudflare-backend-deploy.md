# IC123 后端部署指南

## 🚀 快速部署

### 1. 安装Wrangler并登录
```bash
npm install -g wrangler
wrangler login
```

### 2. 设置环境变量
```bash
# 运行自动配置脚本
./deploy/setup-backend-secrets.sh

# 或手动设置
cd backend
wrangler secret put SUPABASE_URL --env production
wrangler secret put SUPABASE_ANON_KEY --env production  
wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env production
```

### 3. 部署
```bash
cd backend
npm run deploy
```

## 📋 部署后配置

### 更新前端API地址
部署成功后，在Cloudflare Pages中更新环境变量：
```
NEXT_PUBLIC_API_URL=https://ic123-backend.your-subdomain.workers.dev
```

### 测试API
访问健康检查端点验证部署：
```
https://ic123-backend.your-subdomain.workers.dev/api/health
```

## 🔧 本地开发
```bash
cd backend
npm run dev
# 访问 http://localhost:8787
```

## 📊 监控
```bash
# 查看实时日志
wrangler tail --env production

# 查看部署状态  
wrangler deployments list
```

## ✅ 完成
后端API现在运行在Cloudflare Workers上，享有：
- 全球CDN加速
- 自动扩缩容
- 每天100,000免费请求
- 与前端完美集成 