'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { likeApi, LikeToggle } from '../../lib/api'

interface LikeButtonProps {
  resourceType: 'news' | 'comment'
  resourceId: string
  initialLikeCount?: number
  initialIsLiked?: boolean
  onLikeChange?: (isLiked: boolean, likeCount: number) => void
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
}

export default function LikeButton({
  resourceType,
  resourceId,
  initialLikeCount = 0,
  initialIsLiked = false,
  onLikeChange,
  size = 'md',
  showCount = true
}: LikeButtonProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)

  // 获取点赞状态
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await likeApi.getLikeStatus(resourceType, resourceId)
        if (response.success) {
          setIsLiked(response.data.isLiked)
          setLikeCount(response.data.likeCount)
        }
      } catch (error) {
        console.error('获取点赞状态失败:', error)
      }
    }

    fetchLikeStatus()
  }, [resourceType, resourceId])

  const handleToggleLike = async () => {
    if (!user) {
      // TODO: 显示登录提示
      alert('请先登录后再点赞')
      return
    }

    if (isLoading) return

    setIsLoading(true)
    
    try {
      const response = await likeApi.toggleLike({
        resourceType,
        resourceId
      })

      if (response.success) {
        const newIsLiked = response.data.isLiked
        const newLikeCount = response.data.likeCount
        
        setIsLiked(newIsLiked)
        setLikeCount(newLikeCount)
        
        onLikeChange?.(newIsLiked, newLikeCount)
      }
    } catch (error) {
      console.error('点赞操作失败:', error)
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'p-1 text-xs',
    md: 'p-1.5 text-sm',
    lg: 'p-2 text-base'
  }

  return (
    <button
      onClick={handleToggleLike}
      disabled={isLoading}
      className={`
        inline-flex items-center space-x-1 rounded-full transition-all duration-200
        ${buttonSizeClasses[size]}
        ${isLiked 
          ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100' 
          : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isLiked ? '取消点赞' : '点赞'}
    >
      <Heart 
        className={`${sizeClasses[size]} transition-all duration-200 ${
          isLiked ? 'fill-current' : ''
        }`}
      />
      {showCount && (
        <span className="font-medium">
          {likeCount > 0 ? likeCount : ''}
        </span>
      )}
    </button>
  )
}