# IC123 - IC行业信息聚合平台

专业的IC行业信息聚合平台，为集成电路从业者提供精选的网站导航、最新行业资讯和优质公众号推荐。

## 🚀 本地开发环境搭建

### 环境要求
- Node.js >= 18
- Python >= 3.8
- npm >= 8

### 1. 克隆项目
```bash
git clone <your-repo-url>
cd ic123
```

### 2. 配置Supabase数据库

#### 创建Supabase项目
1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 记录项目信息：
   - Project URL: `https://your-project-id.supabase.co`
   - API Key (anon): `eyJhbGci...`
   - Service Role Key: `eyJhbGci...`

#### 初始化数据库
在Supabase Dashboard的SQL Editor中依次执行：
```sql
-- 1. 执行 database/schema.sql
-- 2. 执行 database/seed_data.sql  
-- 3. 执行 database/rls_policies.sql
```

### 3. 配置后端API

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `backend/.env`：
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development
PORT=3001
```

启动后端服务：
```bash
npm run dev
```

验证API：访问 http://localhost:3001/api/health

### 4. 配置爬虫系统

```bash
cd crawler

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
```

编辑 `crawler/.env`：
```bash
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

测试爬虫：
```bash
# 检查系统状态
python main.py status

# 手动运行新闻爬取
python main.py news
```

### 5. 配置前端应用

```bash
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
```

编辑 `frontend/.env.local`：
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

启动前端应用：
```bash
npm run dev
```

访问应用：http://localhost:3000

## 📋 本地测试清单

### 数据库测试
- [ ] 数据库连接正常
- [ ] 表结构创建成功
- [ ] 示例数据插入正常
- [ ] RLS策略配置正确

### 后端API测试
- [ ] 健康检查：`GET /api/health`
- [ ] 分类列表：`GET /api/categories`
- [ ] 网站列表：`GET /api/websites`
- [ ] 新闻列表：`GET /api/news`
- [ ] 搜索功能：`GET /api/search?q=芯片`

### 爬虫系统测试
- [ ] 系统状态检查正常
- [ ] 新闻爬取功能正常
- [ ] 网站检查功能正常
- [ ] 数据保存到数据库

### 前端应用测试
- [ ] 首页加载正常
- [ ] 分类导航正常
- [ ] 搜索功能正常
- [ ] 响应式设计正常
- [ ] API调用正常

## 🔧 常见问题解决

### 数据库连接失败
```bash
# 检查环境变量
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# 检查网络连接
curl -I https://your-project-id.supabase.co
```

### API调用失败
```bash
# 检查后端服务状态
curl http://localhost:3001/api/health

# 检查CORS配置
# 确保frontend的URL在backend的CORS_ORIGIN中
```

### 爬虫运行失败
```bash
# 检查依赖安装
pip list | grep -E "(requests|beautifulsoup4|supabase)"

# 检查日志
tail -f logs/crawler_$(date +%Y-%m-%d).log
```

### 前端构建失败
```bash
# 清理缓存
rm -rf .next
npm run build

# 检查TypeScript错误
npm run type-check
```

## 📊 性能优化建议

### 后端优化
- 使用Redis缓存热门数据
- 实现API响应缓存
- 优化数据库查询索引

### 前端优化
- 启用图片懒加载
- 实现虚拟滚动
- 优化包体积大小

### 爬虫优化
- 增加请求重试机制
- 实现增量更新
- 添加代理轮换

## 🚀 部署准备

### 构建检查
```bash
# 后端构建
cd backend && npm run build

# 前端构建
cd frontend && npm run build

# 检查构建产物
ls -la backend/dist
ls -la frontend/.next
```

### 环境变量配置
确保所有环境变量都已正确配置用于生产环境：
- 更新API域名
- 使用生产数据库
- 配置安全密钥

### 依赖检查
```bash
# 检查安全漏洞
npm audit

# 更新依赖
npm update
```

## 📝 开发命令速查

```bash
# 后端开发
cd backend
npm run dev          # 开发模式
npm run build        # 构建
npm run lint         # 代码检查

# 前端开发  
cd frontend
npm run dev          # 开发模式
npm run build        # 构建
npm run lint         # 代码检查

# 爬虫运行
cd crawler
python main.py status    # 检查状态
python main.py news      # 爬取新闻
python main.py schedule  # 启动调度器
```

## 🔗 相关链接

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Express.js 文档](https://expressjs.com)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages)