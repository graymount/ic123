'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  TrendingUp, 
  Globe, 
  Newspaper, 
  MessageSquare, 
  ExternalLink,
  ArrowRight,
  Star,
  Eye,
  Calendar
} from 'lucide-react'
import { motion } from 'framer-motion'
import { categoryApi, websiteApi, newsApi, wechatApi, type Category, type Website, type News, type WechatAccount } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatTimeAgo, getIconFromName, truncateText, extractDomain } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredWebsites, setFeaturedWebsites] = useState<Website[]>([])
  const [latestNews, setLatestNews] = useState<News[]>([])
  const [topWechatAccounts, setTopWechatAccounts] = useState<WechatAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 加载首页数据
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true)
        
        // 并行加载数据
        const [categoriesRes, websitesRes, newsRes, wechatRes] = await Promise.all([
          categoryApi.getAll(),
          websiteApi.getAll({ limit: 8, sort: 'rating' }),
          newsApi.getAll({ limit: 6, featured: true }),
          wechatApi.getAll({ limit: 6, verified: true })
        ])

        setCategories(categoriesRes.data)
        setFeaturedWebsites(websitesRes.data)
        setLatestNews(newsRes.data)
        setTopWechatAccounts(wechatRes.data)
      } catch (error) {
        console.error('加载首页数据失败:', error)
        toast.error('加载数据失败，请刷新页面重试')
      } finally {
        setIsLoading(false)
      }
    }

    loadHomeData()
  }, [])

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
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="container py-16 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              IC行业信息聚合平台
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              为集成电路从业者精心整理的网站导航、行业资讯和优质公众号推荐，
              助力您高效获取行业信息，把握发展机遇
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/websites">
                  <Globe className="mr-2 h-5 w-5" />
                  探索网站导航
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/news">
                  <Newspaper className="mr-2 h-5 w-5" />
                  浏览最新资讯
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container py-12 space-y-16">
        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">网站分类导航</h2>
            <p className="text-gray-600">按类别浏览精选的IC行业相关网站</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/websites?category=${category.id}`}
                className="group"
              >
                <Card className="card-hover text-center p-6 border-2 group-hover:border-primary-200">
                  <div className="text-4xl mb-3">{getIconFromName(category.icon)}</div>
                  <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 text-ellipsis-2">
                    {category.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Featured Websites */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">推荐网站</h2>
              <p className="text-gray-600">高质量的IC行业相关网站推荐</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/websites">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredWebsites.map((website) => (
              <Card key={website.id} className="card-hover cursor-pointer" onClick={() => handleWebsiteClick(website)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center text-sm">
                        {website.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{website.name}</h3>
                        <p className="text-sm text-gray-500">{extractDomain(website.url)}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  
                  <p className="text-sm text-gray-600 text-ellipsis-3 mb-4">
                    {website.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {website.visit_count}
                      </span>
                      {website.rating > 0 && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-400" />
                          {website.rating}
                        </span>
                      )}
                    </div>
                    <span className="tag-blue">{website.category_name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Latest News */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">最新资讯</h2>
              <p className="text-gray-600">了解IC行业最新动态和趋势</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/news">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestNews.map((news) => (
              <Link key={news.id} href={`/news/${news.id}`} className="group">
                <Card className="card-hover h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="tag-blue">{news.category}</span>
                      <span className="text-xs text-gray-500">{news.source}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-3 text-ellipsis-2 group-hover:text-primary-600 transition-colors">
                      {news.title}
                    </h3>
                    
                    <p className="text-sm text-gray-600 text-ellipsis-3 mb-4">
                      {news.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatTimeAgo(news.published_at)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {news.view_count}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* WeChat Accounts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">优质公众号</h2>
              <p className="text-gray-600">值得关注的IC行业微信公众号</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/wechat">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topWechatAccounts.map((account) => (
              <Card key={account.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{account.name}</h3>
                        {account.is_verified && (
                          <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      {account.positioning && (
                        <p className="text-sm text-gray-500 mb-2">{account.positioning}</p>
                      )}
                      
                      <p className="text-sm text-gray-600 text-ellipsis-3">
                        {account.description}
                      </p>
                      
                      {account.follower_count && (
                        <p className="text-xs text-gray-500 mt-2">
                          粉丝数量: {account.follower_count.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl text-white p-8 lg:p-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">平台数据统计</h2>
            <p className="text-primary-100">持续为IC行业从业者提供优质信息服务</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-primary-100">精选网站</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100">新闻资讯</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">优质公众号</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">每日</div>
              <div className="text-primary-100">内容更新</div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  )
}

// 加载骨架屏组件
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="container py-16 lg:py-24 text-center">
          <div className="skeleton h-16 w-96 mx-auto mb-6" />
          <div className="skeleton h-6 w-128 mx-auto mb-8" />
          <div className="flex justify-center space-x-4">
            <div className="skeleton h-12 w-40" />
            <div className="skeleton h-12 w-40" />
          </div>
        </div>
      </div>
      
      <div className="container py-12 space-y-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      </div>
    </div>
  )
}