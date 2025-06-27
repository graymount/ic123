import NewsDetailClient from './NewsDetailClient'

// 提供一些示例ID用于静态生成
export async function generateStaticParams() {
  // 返回一些常见的UUID格式示例
  // 实际的新闻页面会在运行时动态生成
  return [
    { id: 'cfd3a603-b72a-4e2f-ae27-343e82fb988e' },
    { id: '6acbb377-749f-414a-9d85-b7170e85b44a' },
    { id: '48d3bb67-d2d6-484a-b180-b8dbcc81a422' },
  ]
}

// 设置为动态路由，支持客户端渲染
export const dynamicParams = true

export default function NewsDetailPage() {
  return <NewsDetailClient />
}