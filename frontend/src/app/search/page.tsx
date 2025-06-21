'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Globe, Calendar, MessageCircle, Filter } from 'lucide-react'
import { searchApi, type SearchResult } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatTimeAgo } from '@/lib/utils'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const searchTypes = [
    { value: 'all', label: '全部', icon: Search },
    { value: 'websites', label: '网站', icon: Globe },
    { value: 'news', label: '新闻', icon: Calendar },
    { value: 'wechat', label: '微信公众号', icon: MessageCircle },
  ]

  useEffect(() => {
    const query = searchParams?.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    if (!searchTerm.trim()) return

    try {
      setIsLoading(true)
      setHasSearched(true)
      const response = await searchApi.search({
        query: searchTerm,
        type: selectedType === 'all' ? undefined : selectedType,
        limit: 50
      })
      setResults(response.data)
    } catch (error) {
      console.error('搜索失败:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultClick = async (result: SearchResult) => {
    try {
      if (result.type === 'website') {
        await searchApi.recordWebsiteVisit(result.id)
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } else if (result.type === 'news') {
        await searchApi.recordNewsView(result.id)
        window.open(result.url, '_blank', 'noopener,noreferrer')
      } else if (result.type === 'wechat') {
        await searchApi.recordWechatView(result.id)
        if (result.url) {
          window.open(result.url, '_blank', 'noopener,noreferrer')
        }
      }
    } catch (error) {
      console.error('记录点击失败:', error)
      if (result.url) {
        window.open(result.url, '_blank', 'noopener,noreferrer')
      }
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'website': return Globe
      case 'news': return Calendar
      case 'wechat': return MessageCircle
      default: return Search
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'website': return '网站'
      case 'news': return '新闻'
      case 'wechat': return '微信公众号'
      default: return '未知'
    }
  }

  return (
    <div className="container py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">全站搜索</h1>
        <p className="text-gray-600">搜索网站、新闻和微信公众号，快速找到您需要的信息。</p>
      </div>

      {/* 搜索框 */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="输入搜索关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <Button 
            onClick={() => handleSearch()}
            disabled={!searchQuery.trim() || isLoading}
            className="px-8 py-3 text-lg"
          >
            {isLoading ? '搜索中...' : '搜索'}
          </Button>
        </div>
      </div>

      {/* 类型筛选 */}
      <div className="flex items-center gap-4 mb-8">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          {searchTypes.map((type) => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-primary-100 text-primary-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 搜索结果 */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24" />
          ))}
        </div>
      ) : hasSearched ? (
        results.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到结果</h3>
            <p className="text-gray-500">试试使用不同的关键词或筛选条件。</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              找到 {results.length} 个结果
            </div>
            {results.map((result) => {
              const Icon = getResultIcon(result.type)
              return (
                <Card 
                  key={`${result.type}-${result.id}`} 
                  className="card-hover cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="tag-blue">{getResultTypeLabel(result.type)}</span>
                          {result.category && (
                            <span className="tag-gray">{result.category}</span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                          {result.title}
                        </h3>
                        
                        {result.description && (
                          <p className="text-gray-600 text-sm mb-3 text-ellipsis-3">
                            {result.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            {result.published_at && (
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatTimeAgo(result.published_at)}
                              </span>
                            )}
                            {result.view_count !== undefined && (
                              <span>{result.view_count} 查看</span>
                            )}
                            {result.source && (
                              <span>来源: {result.source}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">开始搜索</h3>
          <p className="text-gray-500">输入关键词来搜索网站、新闻和微信公众号。</p>
        </div>
      )}
    </div>
  )
}