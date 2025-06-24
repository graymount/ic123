'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, authApi, setAuthToken } from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string, displayName?: string) => Promise<void>
  logout: () => void
  verifyEmail: (token: string) => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从localStorage加载token和用户信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('auth_token')
        const savedUser = localStorage.getItem('auth_user')

        if (savedToken && savedUser) {
          setAuthToken(savedToken)
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
          
          // 验证token是否有效
          try {
            const response = await authApi.getProfile()
            if (response.success) {
              setUser(response.data.user)
              localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            }
          } catch (error) {
            // Token无效，清除认证信息
            logout()
          }
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      if (response.success) {
        const { user, token } = response.data
        
        setUser(user)
        setToken(token)
        setAuthToken(token)
        
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const register = async (email: string, password: string, username: string, displayName?: string) => {
    try {
      const response = await authApi.register({ email, password, username, displayName })
      if (response.success) {
        const { user, token } = response.data
        
        setUser(user)
        setToken(token)
        setAuthToken(token)
        
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      } else {
        throw new Error(response.message || '注册失败')
      }
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setAuthToken(null)
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await authApi.verifyEmail(verificationToken)
      if (response.success) {
        // 刷新用户信息
        await refreshProfile()
      } else {
        throw new Error(response.message || '邮箱验证失败')
      }
    } catch (error) {
      console.error('邮箱验证失败:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    try {
      if (token) {
        const response = await authApi.getProfile()
        if (response.success) {
          setUser(response.data.user)
          localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        }
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error)
    }
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    verifyEmail,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}