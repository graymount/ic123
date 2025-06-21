'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Globe, ExternalLink, Search, Filter } from 'lucide-react'
import { websiteApi, categoryApi, type Website, type Category } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatTimeAgo, extractDomain, getIconFromName } from '@/lib/utils'

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [categoriesRes, websitesRes] = await Promise.all([
          categoryApi.getAll(),
          websiteApi.getAll({ 
            category_id: selectedCategory || undefined,
            search: searchQuery || undefined 
          })
        ])
        setCategories(categoriesRes.data)
        setWebsites(websitesRes.data)
      } catch (error) {
        console.error('加载数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedCategory, searchQuery])

  const handleWebsiteClick = async (website: Website) => {
    try {
      await websiteApi.recordVisit(website.id)
      window.open(website.url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('记录访问失败:', error)
      window.open(website.url, '_blank', 'noopener,noreferrer')
    }
  }

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
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">网站导航</h1>
        <p className="text-gray-600">精选的IC行业相关网站，按分类整理，助您快速找到所需资源。</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="搜索网站..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">所有分类</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
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
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-100 text-primary-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {getIconFromName(category.icon)} {category.name}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website) => (
            <Card 
              key={website.id} 
              className="card-hover cursor-pointer" 
              onClick={() => handleWebsiteClick(website)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold">
                      {website.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{website.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{extractDomain(website.url)}</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                  <span>访问量: {website.visit_count}</span>
                  {website.category_name && (
                    <span className="tag-gray">{website.category_name}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}