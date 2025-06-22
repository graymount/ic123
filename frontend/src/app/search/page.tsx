'use client'

import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function SearchPage() {
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
              className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button className="px-8 py-3 text-lg bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            搜索
          </button>
        </div>
      </div>

      {/* 功能开发中提示 */}
      <Card>
        <CardContent className="p-12 text-center">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">搜索功能开发中</h2>
          <p className="text-gray-600 mb-8">
            我们正在努力开发更强大的搜索功能，敬请期待！
          </p>
          <div className="text-sm text-gray-500">
            <p>您可以通过以下方式浏览内容：</p>
            <div className="mt-4 flex justify-center space-x-4">
              <a href="/websites" className="text-primary-600 hover:text-primary-700">专业网站</a>
              <a href="/news" className="text-primary-600 hover:text-primary-700">行业新闻</a>
              <a href="/wechat" className="text-primary-600 hover:text-primary-700">微信公众号</a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}