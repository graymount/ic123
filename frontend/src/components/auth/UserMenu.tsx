'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../lib/auth'
import LoginModal from './LoginModal'
import RegisterModal from './RegisterModal'

export default function UserMenu() {
  const { user, logout, isLoading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSwitchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const handleSwitchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('登录按钮被点击', showLoginModal)
              setShowLoginModal(true)
            }}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 focus:outline-none transition-colors cursor-pointer"
          >
            登录
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('注册按钮被点击', showRegisterModal)
              setShowRegisterModal(true)
            }}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            注册
          </button>
        </div>

        {/* 调试信息 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 bg-yellow-100 p-2 text-xs rounded z-50">
            Login: {showLoginModal ? 'true' : 'false'}, Register: {showRegisterModal ? 'true' : 'false'}
          </div>
        )}

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => {
            console.log('关闭登录模态框')
            setShowLoginModal(false)
          }}
          onSwitchToRegister={handleSwitchToRegister}
        />
        
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => {
            console.log('关闭注册模态框')
            setShowRegisterModal(false)
          }}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* 用户头像和信息 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-white">
            {user.displayName ? user.displayName[0] : user.username[0]}
          </span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.displayName || user.username}
          </p>
          {!user.isVerified && (
            <p className="text-xs text-orange-600">未验证</p>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName || user.username}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              {!user.isVerified && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ 邮箱未验证
                </p>
              )}
            </div>
            
            <button
              onClick={() => {
                // TODO: 实现个人资料页面
                setIsMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              个人资料
            </button>
            
            <button
              onClick={() => {
                // TODO: 实现我的点赞页面
                setIsMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              我的点赞
            </button>
            
            <button
              onClick={() => {
                logout()
                setIsMenuOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
            >
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}