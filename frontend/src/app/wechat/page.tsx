'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Users, QrCode } from 'lucide-react'
import { wechatApi, type WechatAccount } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/Card'

export default function WechatPage() {
  const [accounts, setAccounts] = useState<WechatAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        console.log('开始加载微信公众号数据...')
        
        const response = await wechatApi.getAll({ limit: 30 })
        console.log('API响应:', response)
        
        if (response.success && response.data) {
          setAccounts(response.data)
          console.log('加载成功，数据数量:', response.data.length)
        } else {
          setError('API返回格式错误')
        }
      } catch (error) {
        console.error('加载微信公众号失败:', error)
        setError(error instanceof Error ? error.message : '加载失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">微信公众号</h1>
          <p className="text-gray-600">正在加载公众号数据...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="skeleton h-64" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">微信公众号</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">加载失败</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">微信公众号</h1>
        <p className="text-gray-600">精选的IC行业微信公众号，获取第一手行业资讯和专业观点。</p>
        <p className="text-sm text-gray-500 mt-2">共找到 {accounts.length} 个公众号</p>
      </div>

      {/* 公众号列表 */}
      {accounts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无公众号</h3>
          <p className="text-gray-500">没有找到符合条件的微信公众号，请稍后再来查看。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <Card key={account.id} className="card-hover">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                    {account.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">{account.name}</h3>
                    {account.wechat_id && (
                      <p className="text-sm text-gray-500">{account.wechat_id}</p>
                    )}
                  </div>
                  {account.qr_code_url && (
                    <QrCode className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  {account.description}
                </p>
                
                {account.positioning && (
                  <p className="text-xs text-gray-500 mb-4">
                    定位：{account.positioning}
                  </p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  {account.tags && account.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {account.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {account.is_verified && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      已认证
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {account.follower_count || 0} 关注
                  </span>
                  <span>IC技术公众号</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}