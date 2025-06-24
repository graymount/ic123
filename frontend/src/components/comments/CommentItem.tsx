'use client'

import { useState } from 'react'
import { Comment } from '../../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Reply, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import LikeButton from '../ui/LikeButton'
import CommentForm from './CommentForm'

interface CommentItemProps {
  comment: Comment
  onReply: (content: string, parentId?: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  onUpdate: (commentId: string, content: string) => Promise<void>
  currentUserId?: string
}

export default function CommentItem({ 
  comment, 
  onReply, 
  onDelete, 
  onUpdate, 
  currentUserId 
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === comment.user.id
  const canEdit = isOwner
  const canDelete = isOwner

  const handleDelete = async () => {
    if (!confirm('确定要删除这条评论吗？')) {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(comment.id)
    } catch (error) {
      console.error('删除评论失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = async (content: string) => {
    try {
      await onUpdate(comment.id, content)
      setShowEditForm(false)
    } catch (error) {
      throw error
    }
  }

  const handleReply = async (content: string) => {
    try {
      await onReply(content, comment.id)
      setShowReplyForm(false)
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="space-y-3">
      {/* 主评论 */}
      <div className="flex space-x-3">
        {/* 用户头像 */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {comment.user.displayName 
                ? comment.user.displayName[0] 
                : comment.user.username[0]
              }
            </span>
          </div>
        </div>

        {/* 评论内容 */}
        <div className="flex-1 min-w-0">
          {/* 用户信息和时间 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">
                {comment.user.displayName || comment.user.username}
              </h4>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: zhCN
                })}
              </span>
              {comment.createdAt !== comment.updatedAt && (
                <span className="text-xs text-gray-400">(已编辑)</span>
              )}
            </div>

            {/* 操作菜单 */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-24 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setShowEditForm(true)
                            setShowMenu(false)
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>编辑</span>
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            handleDelete()
                            setShowMenu(false)
                          }}
                          disabled={isDeleting}
                          className="flex items-center space-x-2 w-full px-3 py-1 text-sm text-red-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>{isDeleting ? '删除中...' : '删除'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 评论文本 */}
          {showEditForm ? (
            <div className="mt-2">
              <CommentForm
                onSubmit={handleUpdate}
                placeholder="编辑评论..."
                autoFocus
                onCancel={() => setShowEditForm(false)}
              />
            </div>
          ) : (
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* 操作按钮 */}
          {!showEditForm && (
            <div className="flex items-center space-x-4 mt-2">
              <LikeButton
                resourceType="comment"
                resourceId={comment.id}
                initialLikeCount={comment.likeCount}
                size="sm"
              />
              
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <Reply className="w-4 h-4" />
                <span>回复</span>
              </button>
            </div>
          )}

          {/* 回复表单 */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                placeholder={`回复 @${comment.user.displayName || comment.user.username}...`}
                autoFocus
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* 回复列表 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 space-y-3">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              onUpdate={onUpdate}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  )
}