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
                {displayTitle}
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

                  {(newsItem.content || newsItem.summary) && (
                    <button
                      onClick={handleTranslate}
                      className="flex items-center space-x-1 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                      title={showTranslated ? "显示原文" : "翻译为中文"}
                      disabled={isTranslating}
                    >
                      <Languages className="w-4 h-4" />
                      <span className="text-sm">
                        {isTranslating ? "翻译中..." : (showTranslated ? "显示原文" : "翻译为中文")}
                      </span>
                    </button>
                  )}
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
            {displaySummary && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-blue-900">
                    {newsItem.has_ai_summary ? 'AI智能概要' : '摘要'}
                  </h3>
                  {newsItem.has_ai_summary && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-200 text-blue-800">
                      🤖 AI生成
                    </span>
                  )}
                </div>
                <p className="text-blue-800">
                  {displaySummary}
                </p>
                {newsItem.ai_keywords && newsItem.ai_keywords.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <h4 className="text-xs font-medium text-blue-700 mb-2">关键词</h4>
                    <div className="flex flex-wrap gap-1">
                      {newsItem.ai_keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 新闻内容 */}
            {displayContent && displayContent.trim().length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">正文内容</h3>
                <div className="prose max-w-none text-gray-700 leading-relaxed">
                  {/* 安全地显示纯文本内容，保持段落格式 */}
                  {displayContent.split('\n\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-justify">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* 原文链接 */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {displayContent && displayContent.trim().length > 0 ? (
                    <span>以上内容已在本站完整展示</span>
                  ) : (
                    <span>点击下方链接查看完整内容</span>
                  )}
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