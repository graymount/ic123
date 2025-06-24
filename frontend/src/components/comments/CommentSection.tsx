'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import { commentApi, Comment } from '../../lib/api'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface CommentSectionProps {
  resourceType: 'news'
  resourceId: string
}

export default function CommentSection({ resourceType, resourceId }: CommentSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 获取评论列表
  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const response = await commentApi.getComments(resourceType, resourceId)
      if (response.success) {
        setComments(response.data.comments)
      } else {
        setError('获取评论失败')
      }
    } catch (error) {
      console.error('获取评论失败:', error)
      setError('获取评论失败')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [resourceType, resourceId])

  // 处理新评论提交
  const handleCommentSubmit = async (content: string, parentId?: string) => {
    if (!user) {
      alert('请先登录后再评论')
      return
    }

    try {
      const response = await commentApi.createComment({
        resourceType,
        resourceId,
        content,
        parentId
      })

      if (response.success) {
        // 重新获取评论列表
        await fetchComments()
      }
    } catch (error) {
      console.error('发表评论失败:', error)
      throw error
    }
  }

  // 处理评论删除
  const handleCommentDelete = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId)
      await fetchComments()
    } catch (error) {
      console.error('删除评论失败:', error)
      alert('删除评论失败')
    }
  }

  // 处理评论更新
  const handleCommentUpdate = async (commentId: string, content: string) => {
    try {
      await commentApi.updateComment(commentId, content)
      await fetchComments()
    } catch (error) {
      console.error('更新评论失败:', error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 评论统计 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          评论 ({comments.length})
        </h3>
      </div>

      {/* 评论表单 */}
      {user ? (
        <CommentForm onSubmit={handleCommentSubmit} />
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">请先登录后参与评论</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">暂无评论，快来发表第一条评论吧！</p>
          </div>
        ) : (
          comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleCommentSubmit}
              onDelete={handleCommentDelete}
              onUpdate={handleCommentUpdate}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  )
}