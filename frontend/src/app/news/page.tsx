'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Eye, ExternalLink, Filter, MessageSquare } from 'lucide-react'
import { newsApi, type News } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import LikeButton from '@/components/ui/LikeButton'
import { formatTimeAgo, formatDate } from '@/lib/utils'

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [newsRes, categoriesRes] = await Promise.all([
          newsApi.getAll({ 
            category: selectedCategory || undefined,
            limit: 20 
          }),
          newsApi.getCategories()
        ])
        setNews(newsRes.data)
        setCategories(categoriesRes.data)
      } catch (error) {
        console.error('加载新闻失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedCategory])

  const handleExternalLinkClick = async (newsItem: News, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await newsApi.recordView(newsItem.id)
      window.open(newsItem.original_url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('记录阅读失败:', error)
      window.open(newsItem.original_url, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">行业新闻</h1>
        <p className="text-gray-600">最新的IC行业资讯，了解行业动态和发展趋势。</p>
      </div>

      {/* 分类筛选 */}
      <div className="flex items-center gap-4 mb-8">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 新闻列表 */}
      {news.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无新闻</h3>
          <p className="text-gray-500">没有找到符合条件的新闻，请稍后再来查看。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Featured News */}
          <div className="lg:col-span-2">
            <Link href={`/news/${news[0].id}/`}>
              <Card className="card-hover group">
                <div className="relative h-96">
                  <img 
                    src={news[0].image_url || '/placeholder.svg'} 
                    alt={news[0].title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <span className="tag-blue mb-2">{news[0].category}</span>
                    <h2 className="text-3xl font-bold text-white mb-2 group-hover:underline">{news[0].title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-200">
                      <span>{news[0].source}</span>
                      <span>{formatTimeAgo(news[0].published_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>

          {/* Sidebar News */}
          <div className="space-y-4">
            {news.slice(1, 4).map((newsItem) => (
              <Link key={newsItem.id} href={`/news/${newsItem.id}/`}>
                <Card className="card-hover group">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-600">{newsItem.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{newsItem.source}</span>
                      <span>{formatTimeAgo(newsItem.published_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Rest of the news in a grid */}
          {news.slice(4).map((newsItem) => (
            <Link key={newsItem.id} href={`/news/${newsItem.id}/`}>
              <Card className="card-hover group h-full">
                <CardContent className="p-4">
                  <div className="h-40 mb-4">
                    <img 
                      src={newsItem.image_url || '/placeholder.svg'} 
                      alt={newsItem.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <span className="tag-blue mb-2">{newsItem.category}</span>
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-600">{newsItem.title}</h3>
                  <p className="text-sm text-gray-600 text-ellipsis-3 mb-3">
                    {newsItem.display_summary || newsItem.ai_summary || newsItem.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{newsItem.source}</span>
                    <span>{formatTimeAgo(newsItem.published_at)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}