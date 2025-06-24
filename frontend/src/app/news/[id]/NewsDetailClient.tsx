'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Eye, ExternalLink, ArrowLeft, Share2 } from 'lucide-react'
import { newsApi, type News } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LikeButton from '@/components/ui/LikeButton'
import CommentSection from '@/components/comments/CommentSection'
import { formatTimeAgo, formatDate } from '@/lib/utils'

export default function NewsDetailClient() {
  const params = useParams()
  const router = useRouter()
  const newsId = params.id as string
  
  const [newsItem, setNewsItem] = useState<News | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadNews = async () => {
      if (!newsId) return

      try {
        setIsLoading(true)
        const response = await newsApi.getById(newsId)
        if (response.success) {
          setNewsItem(response.data)
          // 记录浏览
          await newsApi.recordView(newsId)
        } else {
          setError('新闻不存在')
        }
      } catch (error) {
        console.error('加载新闻失败:', error)
        setError('加载新闻失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [newsId])

  const handleShare = async () => {
    if (navigator.share && newsItem) {
      try {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.summary || newsItem.title,
          url: window.location.href
        })
      } catch (error) {
        // 如果分享失败，复制链接到剪贴板
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('链接已复制到剪贴板')
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !newsItem) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">新闻不存在</h1>
          <p className="text-gray-600 mb-6">{error || '您访问的新闻不存在或已被删除'}</p>
          <Button onClick={() => router.push('/news')}>
            返回新闻列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
        </div>

        {/* 新闻内容 */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {/* 新闻头部信息 */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                {newsItem.is_featured && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    推荐
                  </span>
                )}
                {newsItem.category && (
                  <span className="tag-blue">{newsItem.category}</span>
                )}
                <span className="text-sm text-gray-500">{newsItem.source}</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {newsItem.title}
              </h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatTimeAgo(newsItem.published_at)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {newsItem.view_count} 阅读
                  </span>
                  {newsItem.author && (
                    <span>作者: {newsItem.author}</span>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center space-x-3">
                  <LikeButton
                    resourceType="news"
                    resourceId={newsItem.id}
                    size="md"
                  />
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="分享"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">分享</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 新闻图片 */}
            {newsItem.image_url && (
              <div className="mb-6">
                <img
                  src={newsItem.image_url}
                  alt={newsItem.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* 新闻摘要 */}
            {newsItem.summary && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">摘要</h3>
                <p className="text-blue-800">{newsItem.summary}</p>
              </div>
            )}

            {/* 新闻内容 */}
            {newsItem.content && (
              <div className="mb-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: newsItem.content }}
                />
              </div>
            )}

            {/* 查看原文链接 */}
            <div className="pt-6 border-t border-gray-200">
              <a
                href={newsItem.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>查看原文</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 评论区 */}
        <Card id="comments">
          <CardContent className="p-8">
            <CommentSection
              resourceType="news"
              resourceId={newsItem.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}