'use client'

import { useState, useEffect } from 'react'
import { feedbackApi, Feedback } from '@/lib/api'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 加载反馈列表
      const feedbackResponse = await feedbackApi.admin.getList({ limit: 50 })
      if (feedbackResponse.success) {
        setFeedbacks(feedbackResponse.data.feedbacks)
      }

      // 加载统计数据
      const statsResponse = await feedbackApi.admin.getStats()
      if (statsResponse.success) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: Feedback['status']) => {
    try {
      await feedbackApi.admin.updateStatus(id, { status })
      loadData() // 重新加载数据
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    const map = {
      website: '推荐网站',
      wechat: '推荐公众号', 
      bug: '问题反馈',
      suggestion: '功能建议'
    }
    return map[type as keyof typeof map] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">反馈管理后台</h1>
          <p className="mt-2 text-gray-600">管理用户提交的反馈和建议</p>
        </div>

        {/* 统计面板 */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">总反馈数</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-yellow-600">{stats.statusStats.pending || 0}</div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.statusStats.approved || 0}</div>
              <div className="text-sm text-gray-600">已采纳</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.statusStats.reviewed || 0}</div>
              <div className="text-sm text-gray-600">已查看</div>
            </div>
          </div>
        )}

        {/* 反馈列表 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">用户反馈列表</h2>
          </div>
          
          {feedbacks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无反馈数据</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {feedback.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                          {feedback.status === 'pending' ? '待处理' : 
                           feedback.status === 'reviewed' ? '已查看' :
                           feedback.status === 'approved' ? '已采纳' : '已拒绝'}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          {getTypeLabel(feedback.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{feedback.content}</p>
                      {feedback.contact_info && (
                        <p className="text-sm text-gray-500 mb-2">
                          联系方式: {feedback.contact_info}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        提交时间: {format(new Date(feedback.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  </div>

                  {feedback.admin_notes && (
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">管理员备注:</span> {feedback.admin_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {feedback.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(feedback.id, 'reviewed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          标记已查看
                        </button>
                        <button
                          onClick={() => updateStatus(feedback.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          采纳
                        </button>
                        <button
                          onClick={() => updateStatus(feedback.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    {feedback.status === 'reviewed' && (
                      <>
                        <button
                          onClick={() => updateStatus(feedback.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          采纳
                        </button>
                        <button
                          onClick={() => updateStatus(feedback.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    {(feedback.status === 'approved' || feedback.status === 'rejected') && (
                      <button
                        onClick={() => updateStatus(feedback.id, 'pending')}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        重新打开
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}