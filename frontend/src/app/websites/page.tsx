'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, ExternalLink, Search, Filter, BarChart3, Users, TrendingUp } from 'lucide-react'
import { websiteApi, categoryApi, type Website, type Category } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatTimeAgo, extractDomain, getIconFromName } from '@/lib/utils'

interface CategoryWithStats extends Category {
  website_count: number
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'visits'>('rating')
  const [isLoading, setIsLoading] = useState(true)
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        // 使用统计接口获取分类信息
        const [categoriesRes, websitesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://ic123-backend.wnfng-liu.workers.dev'}/api/categories/stats`),
          websiteApi.getAll({ 
            category_id: selectedCategory || undefined,
            search: searchQuery || undefined,
            sort: sortBy
          })
        ])
        
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.data || [])
        setWebsites(websitesRes.data)
      } catch (error) {
        console.error('加载数据失败:', error)
        // 如果统计接口失败，回退到普通接口
        try {
          const categoriesRes = await categoryApi.getAll()
          setCategories(categoriesRes.data.map(cat => ({ ...cat, website_count: 0 })))
        } catch (fallbackError) {
          console.error('获取分类失败:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedCategory, searchQuery, sortBy])

  const handleWebsiteClick = async (website: Website) => {
    try {
      await websiteApi.recordVisit(website.id)
      window.open(website.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('记录访问失败:', error)
      window.open(website.url, '_blank', 'noopener,noreferrer')
    }
  }

  const totalWebsites = categories.reduce((sum, cat) => sum + cat.website_count, 0)
  const filteredWebsiteCount = websites.length

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* 页面标题和统计 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">网站导航</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {showStats ? '隐藏统计' : '显示统计'}
          </Button>
        </div>
        <p className="text-gray-600 mb-4">
          精选的IC行业相关网站，按分类整理，助您快速找到所需资源。
        </p>
        
        {/* 统计信息 */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">总网站数</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{totalWebsites}</span>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">分类数量</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{categories.length}</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">当前显示</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{filteredWebsiteCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="搜索网站名称、描述或用途..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">所有分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.website_count})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">排序:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'visits')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rating">评分</option>
              <option value="visits">访问量</option>
              <option value="name">名称</option>
            </select>
          </div>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          全部 ({totalWebsites})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            {getIconFromName(category.icon)} 
            {category.name} 
            <span className="text-xs opacity-75">({category.website_count})</span>
          </button>
        ))}
      </div>

      {/* 网站列表 */}
      {websites.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无网站</h3>
          <p className="text-gray-500">没有找到符合条件的网站，请尝试其他搜索条件。</p>
        </div>
      ) : (
        <>
          {/* 结果统计 */}
          <div className="mb-4 text-sm text-gray-600">
            {searchQuery && (
              <span>搜索 "{searchQuery}" 找到 {filteredWebsiteCount} 个结果</span>
            )}
            {selectedCategory && !searchQuery && (
              <span>分类 "{categories.find(c => c.id === selectedCategory)?.name}" 共 {filteredWebsiteCount} 个网站</span>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <Card 
                key={website.id} 
                className="card-hover cursor-pointer group relative" 
                onClick={() => handleWebsiteClick(website)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {website.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {website.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{extractDomain(website.url)}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <p className="text-sm text-gray-600 text-ellipsis-3 mb-4">
                    {website.description}
                  </p>
                  
                  {website.target_audience && (
                    <div className="mb-4">
                      <span className="tag-blue">{website.target_audience}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {website.visit_count || 0}
                      </span>
                      {website.rating && website.rating > 0 && (
                        <span className="flex items-center gap-1">
                          ⭐ {website.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    {website.category_name && (
                      <span className="tag-gray">{website.category_name}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}