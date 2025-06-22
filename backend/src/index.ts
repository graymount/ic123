import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { logger } from 'hono/logger'

import categoriesRoutes from './routes/categories'
import websitesRoutes from './routes/websites'
import newsRoutes from './routes/news'
import wechatRoutes from './routes/wechat'
import searchRoutes from './routes/search'
import feedbackRoutes from './routes/feedback'

// 定义环境变量类型
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NODE_ENV?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 中间件
app.use('*', logger())
// 暂时禁用压缩，避免响应乱码问题
// app.use('*', compress())
app.use('*', cors({
  origin: ['https://ic123.pages.dev', 'https://icranking.com', 'https://www.icranking.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// 速率限制在Cloudflare层面处理

// 路由 - 带/api前缀
app.route('/api/categories', categoriesRoutes)
app.route('/api/websites', websitesRoutes)
app.route('/api/news', newsRoutes)
app.route('/api/wechat', wechatRoutes)
app.route('/api/search', searchRoutes)
app.route('/api/feedback', feedbackRoutes)

// 路由 - 无/api前缀（兼容前端）
app.route('/categories', categoriesRoutes)
app.route('/websites', websitesRoutes)
app.route('/news', newsRoutes)
app.route('/wechat', wechatRoutes)
app.route('/search', searchRoutes)
app.route('/feedback', feedbackRoutes)

// 健康检查
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'IC123 API is running',
    timestamp: new Date().toISOString(),
    environment: c.env?.NODE_ENV || 'unknown'
  })
})

// 根路径重定向
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'IC123 Backend API',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      websites: '/api/websites',
      news: '/api/news',
      wechat: '/api/wechat',
      search: '/api/search',
      feedback: '/api/feedback'
    }
  })
})

// 404处理
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'API端点不存在'
  }, 404)
})

// 错误处理
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json({
    success: false,
    message: '服务器内部错误'
  }, 500)
})

export default app