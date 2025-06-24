'use client'

import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useAuth } from '../../lib/auth'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // 表单验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('密码长度至少8位')
      setIsLoading(false)
      return
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setError('密码需包含字母和数字')
      setIsLoading(false)
      return
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setError('用户名长度需要3-20位')
      setIsLoading(false)
      return
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.username,
        formData.displayName || undefined
      )
      setSuccess('注册成功！请查收邮箱验证邮件。')
      setTimeout(() => {
        onClose()
        resetForm()
      }, 2000)
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || '注册失败')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      displayName: ''
    })
    setError('')
    setSuccess('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="用户注册">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
            邮箱地址 *
          </label>
          <input
            type="email"
            id="register-email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="请输入邮箱地址"
          />
        </div>

        <div>
          <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
            用户名 *
          </label>
          <input
            type="text"
            id="register-username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            required
            minLength={3}
            maxLength={20}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="3-20位字母、数字、下划线或中文"
          />
        </div>

        <div>
          <label htmlFor="register-displayName" className="block text-sm font-medium text-gray-700 mb-1">
            显示名称
          </label>
          <input
            type="text"
            id="register-displayName"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="可选，默认使用用户名"
          />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
            密码 *
          </label>
          <input
            type="password"
            id="register-password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="至少8位，包含字母和数字"
          />
        </div>

        <div>
          <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            确认密码 *
          </label>
          <input
            type="password"
            id="register-confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="再次输入密码"
          />
        </div>

        <div className="flex flex-col space-y-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '注册中...' : '注册'}
          </Button>
          
          <div className="text-center">
            <span className="text-sm text-gray-600">已有账号？</span>
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="ml-1 text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
            >
              立即登录
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}