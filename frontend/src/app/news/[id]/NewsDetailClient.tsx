'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Calendar, Eye, ExternalLink, ArrowLeft, Share2, Languages } from 'lucide-react'
import { newsApi, translateApi, type News } from '@/lib/api'
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
  const [showTranslated, setShowTranslated] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

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
          text: newsItem.display_summary || newsItem.ai_summary || newsItem.summary || newsItem.title,
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

  const handleTranslate = async () => {
    if (!newsItem) return

    if (showTranslated) {
      setShowTranslated(false)
      return
    }

    // 如果已经有翻译内容，直接显示
    if (newsItem.translated_content) {
      setShowTranslated(true)
      return
    }

    // 否则，调用翻译API
    setIsTranslating(true)
    try {
      const contentToTranslate = newsItem.content || newsItem.summary || newsItem.title
      if (contentToTranslate) {
        const translatedRes = await translateApi.translate(contentToTranslate, 'ZH')
        if (translatedRes.success && translatedRes.data?.translatedText) {
          setNewsItem(prev => prev ? { ...prev, translated_content: translatedRes.data.translatedText } : null)
          setShowTranslated(true)
        } else {
          console.error('翻译失败:', translatedRes.message)
          alert('翻译失败，请稍后再试。')
        }
      }
    } catch (err) {
      console.error('翻译请求出错:', err)
      alert('翻译过程中发生错误。')
    } finally {
      setIsTranslating(false)
    }
  }

  const displayTitle = showTranslated && newsItem?.translated_title ? newsItem.translated_title : newsItem?.title
  const displaySummary = showTranslated && newsItem?.translated_summary ? newsItem.translated_summary : (newsItem?.display_summary || newsItem?.ai_summary || newsItem?.summary)
  const displayContent = showTranslated && newsItem?.translated_content ? newsItem.translated_content : newsItem?.content

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

        {/* 文章内容 */}
        <Card>
          <CardContent className="p-8">
            {/* 标题 */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                {displayTitle}
              </h1>
              
              {/* 文章元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <span className="tag-blue">{newsItem.category}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>{newsItem.source}</span>
                  {newsItem.author && <span>• {newsItem.author}</span>}
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(newsItem.published_at)}</span>
                  <span>({formatTimeAgo(newsItem.published_at)})</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{newsItem.view_count}</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex items-center space-x-2"
              >
                <Languages className="w-4 h-4" />
                <span>{isTranslating ? '翻译中...' : showTranslated ? '显示原文' : '中文翻译'}</span>
              </Button>
              
              <LikeButton
                resourceType="news"
                resourceId={newsItem.id}
                size="sm"
              />
            </div>

            {/* 摘要 */}
            {displaySummary && displaySummary.trim().length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-900 mb-2">文章摘要</h3>
                <p className="text-gray-700 leading-relaxed">
                  {displaySummary}
                  {newsItem.has_ai_summary && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      AI概要
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* 正文内容 */}
            {displayContent && displayContent.trim().length > 0 ? (
              <div className="prose prose-gray max-w-none">
                <div
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: displayContent
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^/, '<p>')
                      .replace(/$/, '</p>')
                      .replace(/<p><\/p>/g, '')
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无详细内容，请查看原文链接</p>
              </div>
            )}

            {/* 查看原文链接 */}
            {newsItem.original_url && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    想要了解更多详情？
                  </span>
                </div>
                <a
                  href={newsItem.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{displayContent && displayContent.trim().length > 0 ? '参考原文' : '查看原文'}</span>
                </a>
              </div>
            )}
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