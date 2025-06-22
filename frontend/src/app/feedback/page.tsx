'use client'

import { useState } from 'react'
import { Send, MessageSquare, Star, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { feedbackApi } from '@/lib/api'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState({
    type: 'suggestion',
    subject: '',
    content: '',
    email: '',
    rating: 5
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const feedbackTypes = [
    { value: 'suggestion', label: '功能建议', icon: MessageSquare },
    { value: 'bug', label: '问题反馈', icon: AlertCircle },
    { value: 'website', label: '推荐网站', icon: Star },
    { value: 'wechat', label: '推荐公众号', icon: Star },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.subject.trim() || !feedback.content.trim()) {
      alert('请填写标题和内容')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await feedbackApi.submit({
        type: feedback.type as 'website' | 'wechat' | 'bug' | 'suggestion',
        title: feedback.subject,
        content: feedback.content,
        contact_info: feedback.email || undefined
      })
      
      if (response.success) {
        setSubmitted(true)
      } else {
        console.error('提交反馈失败:', response.message)
        alert(`提交失败：${response.message || '请稍后再试'}`)
      }
    } catch (error: any) {
      console.error('提交反馈失败:', error)
      let errorMessage = '提交失败，请稍后再试'
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFeedback({
      type: 'suggestion',
      subject: '',
      content: '',
      email: '',
      rating: 5
    })
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">感谢您的反馈！</h2>
              <p className="text-gray-600 mb-8">
                您的反馈对我们非常重要，我们会认真考虑您的建议并持续改进产品。
              </p>
              <Button onClick={handleReset}>
                提交新反馈
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">意见反馈</h1>
          <p className="text-gray-600">
            您的意见和建议对我们非常重要，请告诉我们您的想法，帮助我们做得更好。
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 反馈类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  反馈类型
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {feedbackTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, type: type.value })}
                        className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors ${
                          feedback.type === type.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${
                          feedback.type === type.value ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                        <span className={`font-medium ${
                          feedback.type === type.value ? 'text-primary-600' : 'text-gray-700'
                        }`}>
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 评分 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  整体评分
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="p-1"
                    >
                      <Star className={`h-6 w-6 ${
                        star <= feedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`} />
                    </button>
                  ))}
                  <span className="ml-3 text-sm text-gray-600">
                    {feedback.rating} / 5 星
                  </span>
                </div>
              </div>

              {/* 标题 */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  id="subject"
                  value={feedback.subject}
                  onChange={(e) => setFeedback({ ...feedback, subject: e.target.value })}
                  placeholder="简要描述您的反馈主题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 内容 */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  详细内容 *
                </label>
                <textarea
                  id="content"
                  value={feedback.content}
                  onChange={(e) => setFeedback({ ...feedback, content: e.target.value })}
                  placeholder="请详细描述您的意见、建议或问题..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                  required
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 (可选)
                </label>
                <input
                  type="email"
                  id="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  placeholder="如果您希望收到回复，请留下邮箱地址"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  重置
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !feedback.subject.trim() || !feedback.content.trim()}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{isSubmitting ? '提交中...' : '提交反馈'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* 联系信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            您也可以直接发送邮件到 
            <a href="mailto:feedback@ic123.com" className="text-primary-600 hover:text-primary-700">
              feedback@ic123.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}