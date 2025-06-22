'use client'

import { useState } from 'react'
import { feedbackApi, FeedbackData } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface FeedbackFormProps {
  onSuccess?: () => void
  className?: string
}

export default function FeedbackForm({ onSuccess, className = '' }: FeedbackFormProps) {
  const [formData, setFormData] = useState<FeedbackData>({
    type: 'suggestion',
    title: '',
    content: '',
    contact_info: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const feedbackTypes = [
    { value: 'website', label: '推荐网站' },
    { value: 'wechat', label: '推荐公众号' },
    { value: 'bug', label: '问题反馈' },
    { value: 'suggestion', label: '功能建议' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('请填写标题和内容')
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData = {
        ...formData,
        contact_info: formData.contact_info?.trim() || undefined
      }
      
      await feedbackApi.submit(submitData)
      
      toast.success('反馈提交成功，感谢您的建议！')
      
      // 重置表单
      setFormData({
        type: 'suggestion',
        title: '',
        content: '',
        contact_info: ''
      })
      
      onSuccess?.()
    } catch (error) {
      console.error('提交反馈失败:', error)
      toast.error('提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof FeedbackData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          意见反馈
        </h3>
        <p className="text-sm text-gray-600">
          您的反馈对我们非常重要，我们会认真对待每一条建议
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 反馈类型 */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            反馈类型 <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value as FeedbackData['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {feedbackTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* 标题 */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="请简要描述您的反馈"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.title.length}/200
          </div>
        </div>

        {/* 内容 */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            详细内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder={getPlaceholderByType(formData.type)}
            rows={5}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.content.length}/2000
          </div>
        </div>

        {/* 联系方式 */}
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
            联系方式 <span className="text-gray-500">(可选)</span>
          </label>
          <input
            type="text"
            id="contact"
            value={formData.contact_info}
            onChange={(e) => handleChange('contact_info', e.target.value)}
            placeholder="邮箱、微信号或QQ号，方便我们联系您"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-1 text-xs text-gray-500">
            留下联系方式，我们会及时回复您
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '提交中...' : '提交反馈'}
          </button>
        </div>
      </form>
    </div>
  )
}

function getPlaceholderByType(type: FeedbackData['type']): string {
  switch (type) {
    case 'website':
      return '请提供网站名称、网址和推荐理由...'
    case 'wechat':
      return '请提供公众号名称、微信号和推荐理由...'
    case 'bug':
      return '请详细描述您遇到的问题，包括操作步骤和期望结果...'
    case 'suggestion':
      return '请详细描述您的建议或想法...'
    default:
      return '请详细描述您的反馈内容...'
  }
}