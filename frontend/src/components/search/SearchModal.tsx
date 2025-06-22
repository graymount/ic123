'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchApi } from '@/lib/api'
import { debounce } from '@/lib/utils'
import { localStorageGet, localStorageSet } from '@/lib/utils'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (query: string) => void
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 热门搜索关键词
  const trendingKeywords = [
    'EDA工具',
    '半导体制造',
    '芯片设计',
    '人工智能芯片',
    'RISC-V',
    '模拟芯片',
    '汽车芯片',
    '5G芯片'
  ]

  // 获取搜索建议
  const getSuggestions = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await searchApi.getSuggestions(searchQuery)
      setSuggestions(response.data)
    } catch (error) {
      console.error('获取搜索建议失败:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, 300)

  // 加载最近搜索
  useEffect(() => {
    const recent = localStorageGet<string[]>('recentSearches', [])
    setRecentSearches(recent.slice(0, 5))
  }, [])

  // 监听输入变化
  useEffect(() => {
    getSuggestions(query)
  }, [query])

  // 监听开关状态
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setSuggestions([])
    }
  }, [isOpen])

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if (e.key === 'Enter' && query.trim()) {
        handleSearch(query.trim())
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, query, onClose])

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return

    // 保存到最近搜索
    const newRecentSearches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(newRecentSearches)
    localStorageSet('recentSearches', newRecentSearches)

    // 跳转到搜索页面
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    onClose()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorageSet('recentSearches', [])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 overflow-hidden"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative mx-auto mt-16 max-w-2xl px-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center px-4 py-3 border-b border-gray-100">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="搜索网站、新闻、公众号..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 ml-3 text-gray-900 placeholder-gray-500 border-0 outline-none text-lg"
              />
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent" />
              )}
              <button
                onClick={onClose}
                className="ml-3 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {query.trim() ? (
                // 搜索建议
                <div className="p-2">
                  {suggestions.length > 0 ? (
                    <>
                      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        搜索建议
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(suggestion)}
                          className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Search className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <div className="px-3 py-8 text-center text-gray-500">
                      没有找到相关建议
                    </div>
                  )}
                </div>
              ) : (
                // 默认状态：最近搜索和热门关键词
                <div className="p-2 space-y-4">
                  {/* 最近搜索 */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-3 py-2">
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          最近搜索
                        </div>
                        <button
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          清除
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          <Clock className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
                          <span className="truncate">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 热门搜索 */}
                  <div>
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      热门搜索
                    </div>
                    <div className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {trendingKeywords.map((keyword, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(keyword)}
                            className="inline-flex items-center px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>输入关键词搜索网站、新闻和公众号</span>
                <div className="flex items-center space-x-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs">Enter</kbd>
                  <span>搜索</span>
                  <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs ml-2">Esc</kbd>
                  <span>关闭</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}