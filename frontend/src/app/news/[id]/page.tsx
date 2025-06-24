import NewsDetailClient from './NewsDetailClient'

// 必须有 generateStaticParams 才能静态导出
export async function generateStaticParams() {
  // 返回一些示例ID，这些页面会在构建时生成
  // 其他页面将在运行时客户端渲染
  return [
    { id: 'placeholder' },
  ]
}

export default function NewsDetailPage() {
  return <NewsDetailClient />
}