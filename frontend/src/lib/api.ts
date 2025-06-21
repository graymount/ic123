import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

// 创建axios实例
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

// 类型定义
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Website {
  id: string
  name: string
  url: string
  description: string
  category_id: string | null
  target_audience: string | null
  use_case: string | null
  is_active: boolean
  visit_count: number
  rating: number
  tags: string[] | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
  category_name?: string | null
  category_icon?: string | null
}

export interface News {
  id: string
  title: string
  summary: string | null
  content: string | null
  source: string
  author: string | null
  original_url: string
  image_url: string | null
  category: string | null
  tags: string[] | null
  view_count: number
  is_featured: boolean
  published_at: string
  created_at: string
}

export interface WechatAccount {
  id: string
  name: string
  wechat_id: string | null
  description: string
  positioning: string | null
  target_audience: string | null
  operator_background: string | null
  qr_code_url: string | null
  is_verified: boolean
  follower_count: number | null
  is_active: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface SearchResults {
  websites: Website[]
  news: News[]
  wechat: WechatAccount[]
}

export interface FeedbackData {
  type: 'website' | 'wechat' | 'bug' | 'suggestion'
  title: string
  content: string
  contact_info?: string
}

// API函数
export const categoryApi = {
  getAll: (): Promise<ApiResponse<Category[]>> =>
    api.get('/categories').then(res => res.data),
  
  getById: (id: string): Promise<ApiResponse<Category>> =>
    api.get(`/categories/${id}`).then(res => res.data),
}

export const websiteApi = {
  getAll: (params?: {
    category_id?: string
    search?: string
    page?: number
    limit?: number
    sort?: string
  }): Promise<ApiResponse<Website[]>> =>
    api.get('/websites', { params }).then(res => res.data),
  
  getById: (id: string): Promise<ApiResponse<Website>> =>
    api.get(`/websites/${id}`).then(res => res.data),
  
  recordVisit: (id: string): Promise<ApiResponse<void>> =>
    api.post(`/websites/${id}/visit`).then(res => res.data),
}

export const newsApi = {
  getAll: (params?: {
    category?: string
    search?: string
    page?: number
    limit?: number
    featured?: boolean
  }): Promise<ApiResponse<News[]>> =>
    api.get('/news', { params }).then(res => res.data),
  
  getById: (id: string): Promise<ApiResponse<News>> =>
    api.get(`/news/${id}`).then(res => res.data),
  
  recordView: (id: string): Promise<ApiResponse<void>> =>
    api.post(`/news/${id}/view`).then(res => res.data),
  
  getCategories: (): Promise<ApiResponse<string[]>> =>
    api.get('/news/categories').then(res => res.data),
}

export const wechatApi = {
  getAll: (params?: {
    search?: string
    page?: number
    limit?: number
    verified?: boolean
  }): Promise<ApiResponse<WechatAccount[]>> =>
    api.get('/wechat', { params }).then(res => res.data),
  
  getById: (id: string): Promise<ApiResponse<WechatAccount>> =>
    api.get(`/wechat/${id}`).then(res => res.data),
  
  recordView: (id: string): Promise<ApiResponse<void>> =>
    api.post(`/wechat/${id}/view`).then(res => res.data),
}

export const searchApi = {
  search: (query: string, type?: string): Promise<ApiResponse<SearchResults>> =>
    api.get('/search', { params: { q: query, type } }).then(res => res.data),
  
  getSuggestions: (query: string): Promise<ApiResponse<string[]>> =>
    api.get('/search/suggestions', { params: { q: query } }).then(res => res.data),
}

export const feedbackApi = {
  submit: (data: FeedbackData): Promise<ApiResponse<void>> =>
    api.post('/feedback', data).then(res => res.data),
  
  getTypes: (): Promise<ApiResponse<Array<{ value: string; label: string }>>> =>
    api.get('/feedback/types').then(res => res.data),
}