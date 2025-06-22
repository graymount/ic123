# Cloudflare Pages 配置指南

## 📋 前端部署配置

### 1. 基本设置
- **项目名称**: `ic123`
- **Git仓库**: `graymount/ic123`
- **分支**: `main`

### 2. 构建设置

#### Framework preset
选择: **Next.js**

#### 构建命令
```bash
cd frontend && npm ci && npm run build
```

#### 构建输出目录
```
frontend/out
```

#### 根目录
```
/
```

#### 部署命令
```
(留空 - Pages会自动处理静态文件)
```

### 3. 环境变量

在Cloudflare Pages设置中添加以下环境变量：

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://ic123-backend.your-subdomain.workers.dev/api
```

### 4. 高级设置

#### 兼容性日期
```
2024-03-18
```

#### Node.js版本
```
18
```

## 🚀 部署步骤

### 步骤1: 创建Pages项目
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 选择 **Pages** → **Create a project**
3. 选择 **Connect to Git**
4. 授权并选择 `graymount/ic123` 仓库

### 步骤2: 配置构建设置
按照上述配置填写构建设置

### 步骤3: 部署
1. 点击 **Save and Deploy**
2. 等待首次构建完成
3. 访问分配的域名测试

## 🔧 常见问题解决

### 问题1: 构建失败
**原因**: 构建命令错误或依赖安装失败
**解决**: 确保构建命令为 `cd frontend && npm ci && npm run build`

### 问题2: 页面404
**原因**: 构建输出目录配置错误
**解决**: 确保输出目录为 `frontend/out`

### 问题3: API调用失败
**原因**: 环境变量未配置
**解决**: 添加 `NEXT_PUBLIC_API_URL` 环境变量

## 📊 部署验证

部署完成后验证以下内容：
- [ ] 首页可以正常访问
- [ ] 静态资源加载正常
- [ ] 页面路由工作正常
- [ ] 响应式设计正常

## 🌐 自定义域名（可选）

1. 在Pages项目设置中选择 **Custom domains**
2. 添加您的域名
3. 按照提示配置DNS记录
4. 等待SSL证书生成

## 📈 性能优化

Cloudflare Pages自动提供：
- ✅ 全球CDN加速
- ✅ 自动压缩
- ✅ HTTP/2 支持
- ✅ 免费SSL证书
- ✅ 无限带宽 