'use client'

import { useState, useEffect } from 'react'
import { feedbackApi, Feedback, FeedbackStats } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: '' as any,
    type: '' as any,
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 状态和类型的选项
  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'reviewed', label: '已查看' },
    { value: 'approved', label: '已采纳' },
    { value: 'rejected', label: '已拒绝' }
  ]

  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'website', label: '推荐网站' },
    { value: 'wechat', label: '推荐公众号' },
    { value: 'bug', label: '问题反馈' },
    { value: 'suggestion', label: '功能建议' }
  ]

  // 加载反馈列表
  const loadFeedbacks = async () => {
    try {
      setLoading(true)
      const response = await feedbackApi.admin.getList({
        status: filters.status || undefined,
        type: filters.type || undefined,
        page: filters.page,
        limit: filters.limit
      })
      
      if (response.success) {
        setFeedbacks(response.data.feedbacks)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('加载反馈列表失败:', error)
      toast.error('加载反馈列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载统计信息
  const loadStats = async () => {
    try {
      const response = await feedbackApi.admin.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('加载统计信息失败:', error)
    }
  }

  // 更新反馈状态
  const updateFeedbackStatus = async (id: string, status: Feedback['status'], adminNotes?: string) => {
    try {
      setUpdating(id)
      const response = await feedbackApi.admin.updateStatus(id, {
        status,
        admin_notes: adminNotes
      })
      
      if (response.success) {
        toast.success('状态更新成功')
        loadFeedbacks()
        loadStats()
      }
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新状态失败')
    } finally {
      setUpdating(null)
    }
  }

  // 处理筛选变化
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 重置到第一页
    }))
  }

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // 获取状态颜色
  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // 获取类型标签
  const getTypeLabel = (type: Feedback['type']) => {
    const typeMap = {
      website: '推荐网站',
      wechat: '推荐公众号',
      bug: '问题反馈',
      suggestion: '功能建议'
    }
    return typeMap[type] || type
  }

  useEffect(() => {
    loadFeedbacks()
  }, [filters])

  useEffect(() => {
    loadStats()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">意见反馈管理</h1>
        <p className="text-gray-600">管理用户提交的反馈和建议</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">总反馈数</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">{stats.statusStats.pending || 0}</div>
            <div className="text-sm text-gray-600">待处理</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.statusStats.approved || 0}</div>
            <div className="text-sm text-gray-600">已采纳</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.statusStats.reviewed || 0}</div>
            <div className="text-sm text-gray-600">已查看</div>
          </div>
        </div>
      )}

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 反馈列表 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            暂无反馈数据
          </div>
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
                        {statusOptions.find(s => s.value === feedback.status)?.label}
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
                        onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                        disabled={updating === feedback.id}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        标记为已查看
                      </button>
                      <button
                        onClick={() => updateFeedbackStatus(feedback.id, 'approved')}
                        disabled={updating === feedback.id}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        采纳
                      </button>
                      <button
                        onClick={() => updateFeedbackStatus(feedback.id, 'rejected')}
                        disabled={updating === feedback.id}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                  {feedback.status === 'reviewed' && (
                    <>
                      <button
                        onClick={() => updateFeedbackStatus(feedback.id, 'approved')}
                        disabled={updating === feedback.id}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        采纳
                      </button>
                      <button
                        onClick={() => updateFeedbackStatus(feedback.id, 'rejected')}
                        disabled={updating === feedback.id}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        拒绝
                      </button>
                    </>
                  )}
                  {(feedback.status === 'approved' || feedback.status === 'rejected') && (
                    <button
                      onClick={() => updateFeedbackStatus(feedback.id, 'pending')}
                      disabled={updating === feedback.id}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                      重新打开
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {!loading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示第 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-sm">
                第 {pagination.page} / {pagination.totalPages} 页
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}