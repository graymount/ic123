'use client'

import { useState } from 'react'
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import FeedbackModal from './FeedbackModal'

interface FeedbackButtonProps {
  variant?: 'floating' | 'inline'
  className?: string
}

export default function FeedbackButton({ variant = 'floating', className = '' }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-40 ${className}`}
          title="意见反馈"
        >
          <ChatBubbleLeftRightIcon className="h-6 w-6" />
        </button>
        <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" />
        意见反馈
      </button>
      <FeedbackModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}