'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Eye, ExternalLink, Filter } from 'lucide-react'
import { newsApi, type News } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
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

  const handleNewsClick = async (newsItem: News) => {
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
        <div className="space-y-6">
          {news.map((newsItem) => (
            <Card 
              key={newsItem.id} 
              className="card-hover cursor-pointer"
              onClick={() => handleNewsClick(newsItem)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {newsItem.image_url && (
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      <img 
                        src={newsItem.image_url} 
                        alt={newsItem.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
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
                    
                    <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                      {newsItem.title}
                    </h2>
                    
                    {newsItem.summary && (
                      <p className="text-gray-600 text-sm mb-3 text-ellipsis-3">
                        {newsItem.summary}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatTimeAgo(newsItem.published_at)}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {newsItem.view_count} 阅读
                        </span>
                        {newsItem.author && (
                          <span>作者: {newsItem.author}</span>
                        )}
                      </div>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}