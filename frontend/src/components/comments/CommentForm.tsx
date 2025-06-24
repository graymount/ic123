'use client'

import { useState } from 'react'
import { useAuth } from '../../lib/auth'
import Button from '../ui/Button'

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<void>
  parentId?: string
  placeholder?: string
  autoFocus?: boolean
  onCancel?: () => void
}

export default function CommentForm({ 
  onSubmit, 
  parentId, 
  placeholder = '写下你的评论...',
  autoFocus = false,
  onCancel
}: CommentFormProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      setError('评论内容不能为空')
      return
    }

    if (content.trim().length > 1000) {
      setError('评论内容不能超过1000字符')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(content.trim(), parentId)
      setContent('')
      onCancel?.()
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || '发表评论失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <div className="flex space-x-3">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {user.displayName ? user.displayName[0] : user.username[0]}
            </span>
          </div>
        </div>
        
        {/* 评论输入框 */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            rows={3}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          
          {/* 字符计数 */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              {content.length}/1000
            </span>
            
            {/* 操作按钮 */}
            <div className="flex items-center space-x-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  取消
                </button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                size="sm"
              >
                {isSubmitting ? '发表中...' : '发表评论'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}