# IC123 后端API服务

基于 Node.js + Express + TypeScript + Supabase 的 RESTful API 服务。

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 8

### 安装依赖
```bash
cd backend
npm install
```

### 环境配置
1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 填入 Supabase 配置信息：
```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 开发运行
```bash
npm run dev
```

### 生产构建
```bash
npm run build
npm start
```

## 📡 API 端点

### 基础信息
- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`

### 分类管理
- `GET /categories` - 获取所有分类
- `GET /categories/:id` - 获取单个分类

### 网站管理
- `GET /websites` - 获取网站列表
  - Query参数: `category_id`, `search`, `page`, `limit`, `sort`
- `GET /websites/:id` - 获取单个网站详情
- `POST /websites/:id/visit` - 记录网站访问

### 新闻管理
- `GET /news` - 获取新闻列表
  - Query参数: `category`, `search`, `page`, `limit`, `featured`
- `GET /news/categories` - 获取新闻分类
- `GET /news/:id` - 获取单个新闻详情
- `POST /news/:id/view` - 记录新闻阅读

### 公众号管理
- `GET /wechat` - 获取公众号列表
  - Query参数: `search`, `page`, `limit`, `verified`
- `GET /wechat/:id` - 获取单个公众号详情

### 搜索功能
- `GET /search` - 全局搜索
  - Query参数: `q` (必需), `type` (可选: all/websites/news/wechat)
- `GET /search/suggestions` - 搜索建议
  - Query参数: `q`

### 用户反馈
- `POST /feedback` - 提交用户反馈
- `GET /feedback/types` - 获取反馈类型

### 系统状态
- `GET /health` - 健康检查

## 🔒 安全特性

- **Helmet**: HTTP 安全头
- **CORS**: 跨域请求控制
- **Rate Limiting**: 请求频率限制
- **Input Validation**: 使用 Zod 进行输入验证
- **Error Handling**: 统一错误处理

## 📊 响应格式

### 成功响应
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### 错误响应
```json
{
  "success": false,
  "message": "错误信息"
}
```

## 🧪 测试

```bash
npm test
```

## 📝 开发命令

- `npm run dev` - 开发模式启动
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 代码检查
- `npm test` - 运行测试

## 🗂️ 项目结构

```
src/
├── config/         # 配置文件
├── controllers/    # 控制器
├── middleware/     # 中间件
├── routes/         # 路由定义
├── types/          # 类型定义
└── index.ts        # 应用入口
```