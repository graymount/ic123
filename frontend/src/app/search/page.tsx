'use client'

import { useState, useEffect } from 'react'
import { Search, ExternalLink, Calendar, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { searchApi, Website, News, WechatAccount } from '@/lib/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SearchResults {
  websites: Website[]
  news: News[]
  wechat: WechatAccount[]
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery || query
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await searchApi.search(searchTerm.trim())
      console.log('搜索API响应:', response) // 调试日志
      
      if (response && response.success && response.data) {
        // 确保数据结构正确
        const data = {
          websites: Array.isArray(response.data.websites) ? response.data.websites : [],
          news: Array.isArray(response.data.news) ? response.data.news : [],
          wechat: Array.isArray(response.data.wechat) ? response.data.wechat : []
        }
        setResults(data)
        setTotalResults(data.websites.length + data.news.length + data.wechat.length)
        // 更新URL
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', `?q=${encodeURIComponent(searchTerm.trim())}`)
        }
      } else {
        console.error('API响应格式错误:', response)
        setError('搜索失败，请稍后重试')
      }
    } catch (err) {
      console.error('搜索错误详情:', err)
      setError('搜索服务暂时不可用')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  // 从URL参数获取初始查询
  useEffect(() => {
    // 确保在客户端才执行
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('q')
      if (q) {
        setQuery(q)
        handleSearch(q)
      }
    }
  }, [])

  return (
    <div className="container py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">全站搜索</h1>
        <p className="text-gray-600">搜索网站、新闻和微信公众号，快速找到您需要的信息。</p>
      </div>

      {/* 搜索框 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="输入搜索关键词..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="px-8 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </form>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 搜索结果 */}
      {results && (
        <div className="space-y-8">
          {/* 结果统计 */}
          <div className="text-gray-600">
            找到 <span className="font-medium text-gray-900">{totalResults}</span> 个结果
            {query && <span> - &quot;{query}&quot;</span>}
          </div>

          {/* 网站结果 */}
          {results.websites.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <ExternalLink className="h-5 w-5 mr-2" />
                专业网站 ({results.websites.length})
              </h2>
              <div className="grid gap-4">
                {results.websites.map((website) => (
                  <Card key={website.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            <a 
                              href={website.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {website.name}
                            </a>
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">{website.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>访问量: {website.visit_count}</span>
                            <span>评分: {website.rating}/5</span>
                            {website.target_audience && (
                              <span>面向: {website.target_audience}</span>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400 ml-4 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 新闻结果 */}
          {results.news.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                行业新闻 ({results.news.length})
              </h2>
              <div className="grid gap-4">
                {results.news.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {article.image_url && (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            <a 
                              href={article.original_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-blue-600 transition-colors"
                            >
                              {article.title}
                            </a>
                          </h3>
                          {article.summary && (
                            <p className="text-gray-600 mb-3 line-clamp-2">{article.summary}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{article.source}</span>
                            <span>{format(new Date(article.published_at), 'yyyy-MM-dd', { locale: zhCN })}</span>
                            <span>阅读: {article.view_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 微信公众号结果 */}
          {results.wechat.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                微信公众号 ({results.wechat.length})
              </h2>
              <div className="grid gap-4">
                {results.wechat.map((account) => (
                  <Card key={account.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {account.qr_code_url && (
                          <img 
                            src={account.qr_code_url} 
                            alt={`${account.name}二维码`}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
                            {account.is_verified && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">已认证</span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{account.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            {account.wechat_id && <span>ID: {account.wechat_id}</span>}
                            {account.follower_count && <span>粉丝: {account.follower_count}</span>}
                            {account.positioning && <span>定位: {account.positioning}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 无结果提示 */}
          {totalResults === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">未找到相关结果</h2>
                <p className="text-gray-600 mb-8">
                  尝试使用不同的关键词或浏览以下内容：
                </p>
                <div className="flex justify-center space-x-4">
                  <a href="/websites/" className="text-blue-600 hover:text-blue-700">专业网站</a>
                  <a href="/news/" className="text-blue-600 hover:text-blue-700">行业新闻</a>
                  <a href="/wechat/" className="text-blue-600 hover:text-blue-700">微信公众号</a>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 初始状态：未搜索时显示热门关键词 */}
      {!results && !loading && (
        <Card>
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              热门搜索
            </h2>
            <div className="flex flex-wrap gap-2">
              {['EDA工具', '半导体制造', '芯片设计', '人工智能芯片', 'RISC-V', '模拟芯片', '汽车芯片', '5G芯片'].map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => {
                    setQuery(keyword)
                    handleSearch(keyword)
                  }}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}