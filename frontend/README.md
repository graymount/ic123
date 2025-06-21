# IC123 前端应用

基于 Next.js 14 + TypeScript + Tailwind CSS 构建的现代化IC行业信息聚合平台前端应用。

## 🚀 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件**: 自定义组件库
- **动画**: Framer Motion
- **状态管理**: React Hooks
- **数据获取**: Axios + SWR
- **图标**: Lucide React
- **通知**: React Hot Toast

## 🎯 主要功能

### 核心页面
- **首页**: 分类导航、推荐网站、最新资讯、优质公众号
- **网站导航**: 分类浏览、搜索过滤、详情查看
- **行业新闻**: 列表展示、分类筛选、详情阅读
- **公众号推荐**: 列表展示、详情查看
- **搜索功能**: 全局搜索、实时建议、结果展示

### 交互特性
- **响应式设计**: 移动端、平板、桌面端适配
- **搜索体验**: 实时搜索建议、最近搜索记录
- **懒加载**: 图片懒加载、无限滚动
- **动画效果**: 页面切换、组件动画
- **主题系统**: 支持浅色/深色模式切换

## 📦 快速开始

### 环境要求
- Node.js >= 18
- npm >= 8

### 安装依赖
```bash
cd frontend
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置环境变量：
```bash
# API配置
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 开发运行
```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建
```bash
npm run build
npm start
```

## 🗂️ 项目结构

```
src/
├── app/                    # Next.js App Router页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── websites/          # 网站导航页面
│   ├── news/              # 新闻页面
│   ├── wechat/            # 公众号页面
│   └── search/            # 搜索页面
├── components/             # 组件库
│   ├── ui/                # 基础UI组件
│   ├── layout/            # 布局组件
│   ├── search/            # 搜索组件
│   └── common/            # 通用组件
├── lib/                   # 工具库
│   ├── api.ts             # API客户端
│   ├── utils.ts           # 工具函数
│   └── hooks.ts           # 自定义Hooks
└── types/                 # 类型定义
```

## 🎨 设计系统

### 颜色方案
```css
/* 主色调 */
primary: #3b82f6     /* 蓝色 */
secondary: #6b7280   /* 灰色 */
success: #22c55e     /* 绿色 */
warning: #f59e0b     /* 橙色 */
error: #ef4444       /* 红色 */
```

### 组件规范
- **卡片**: 统一的阴影和圆角
- **按钮**: 多种变体（primary, secondary, outline, ghost）
- **输入框**: 一致的边框和焦点状态
- **标签**: 颜色分类和尺寸规范

### 响应式断点
```css
sm: 640px    /* 手机横屏 */
md: 768px    /* 平板 */
lg: 1024px   /* 小屏桌面 */
xl: 1280px   /* 大屏桌面 */
2xl: 1536px  /* 超大屏 */
```

## 🔧 开发工具

### 代码质量
```bash
# ESLint检查
npm run lint

# TypeScript类型检查
npm run type-check
```

### 构建优化
- **代码分割**: 按路由自动分割
- **图片优化**: Next.js Image组件
- **字体优化**: Google Fonts自动优化
- **CSS优化**: Tailwind CSS树摇优化

## 📱 组件示例

### 基础按钮
```tsx
import Button from '@/components/ui/Button'

<Button variant="primary" size="lg" loading={isLoading}>
  点击按钮
</Button>
```

### 卡片组件
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
</Card>
```

### API调用
```tsx
import { websiteApi } from '@/lib/api'

const { data, error } = await websiteApi.getAll({
  category_id: 'xxx',
  page: 1,
  limit: 20
})
```

## 🔍 SEO优化

### 元数据管理
- 动态页面标题和描述
- Open Graph标签
- Twitter Card支持
- 结构化数据标记

### 性能优化
- 图片懒加载
- 代码分割
- 服务端渲染
- 静态资源优化

## 🚀 部署说明

### Vercel部署（推荐）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### Docker部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 环境变量配置
```bash
# 生产环境
NEXT_PUBLIC_API_URL=https://api.ic123.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-key
```

## 📈 性能监控

### 核心指标
- **FCP**: First Contentful Paint < 1.5s
- **LCP**: Largest Contentful Paint < 2.5s
- **CLS**: Cumulative Layout Shift < 0.1
- **FID**: First Input Delay < 100ms

### 监控工具
- Lighthouse CI
- Web Vitals
- Vercel Analytics

## 🤝 开发规范

### 组件命名
- 使用PascalCase命名组件
- 文件名与组件名保持一致
- 导出组件使用默认导出

### 样式规范
- 优先使用Tailwind CSS类名
- 避免内联样式
- 使用CSS变量定义主题色彩

### 类型定义
- 所有API响应需要类型定义
- 组件Props必须定义接口
- 使用严格的TypeScript配置

## 🔗 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [TypeScript 手册](https://www.typescriptlang.org/docs)
- [Framer Motion 文档](https://www.framer.com/motion)