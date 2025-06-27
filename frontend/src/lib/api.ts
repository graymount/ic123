import axios from 'axios'

// 暂时硬编码API地址，确保网站能正常工作
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ic123-backend.wnfng-liu.workers.dev'

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
    console.error('API Base URL:', API_BASE_URL)
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
  translated_title?: string | null
  translated_summary?: string | null
  translated_content?: string | null
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
  ai_summary: string | null
  ai_processed: boolean
  ai_keywords: string[] | null
  ai_processed_at: string | null
  display_summary?: string
  has_ai_summary?: boolean
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

export interface Feedback {
  id: string
  type: 'website' | 'wechat' | 'bug' | 'suggestion'
  title: string
  content: string
  contact_info: string | null
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface FeedbackListResponse {
  feedbacks: Feedback[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FeedbackStats {
  statusStats: Record<string, number>
  typeStats: Record<string, number>
  total: number
}

// 用户认证相关类型
export interface User {
  id: string
  email: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  isVerified: boolean
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
  verificationToken?: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
  displayName?: string
}

export interface LoginData {
  email: string
  password: string
}

// 评论相关类型
export interface CommentUser {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

export interface Comment {
  id: string
  content: string
  parentId: string | null
  likeCount: number
  createdAt: string
  updatedAt: string
  user: CommentUser
  replies?: Comment[]
}

export interface CommentCreate {
  resourceType: 'news'
  resourceId: string
  content: string
  parentId?: string
}

// 点赞相关类型
export interface LikeStatus {
  likeCount: number
  isLiked: boolean
  requiresAuth: boolean
}

export interface LikeToggle {
  resourceType: 'news' | 'comment'
  resourceId: string
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
  submit: (data: FeedbackData): Promise<ApiResponse<Feedback>> =>
    api.post('/feedback', data).then(res => res.data),
  
  getTypes: (): Promise<ApiResponse<Array<{ value: string; label: string }>>> =>
    api.get('/feedback/types').then(res => res.data),
  
  // 管理员API
  admin: {
    getList: (params?: {
      status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
      type?: 'website' | 'wechat' | 'bug' | 'suggestion'
      page?: number
      limit?: number
    }): Promise<ApiResponse<FeedbackListResponse>> =>
      api.get('/feedback/admin', { params }).then(res => res.data),
    
    updateStatus: (id: string, data: {
      status: 'pending' | 'reviewed' | 'approved' | 'rejected'
      admin_notes?: string
    }): Promise<ApiResponse<Feedback>> =>
      api.patch(`/feedback/admin/${id}`, data).then(res => res.data),
    
    getStats: (): Promise<ApiResponse<FeedbackStats>> =>
      api.get('/feedback/admin/stats').then(res => res.data),
  }
}

// 认证API
export const authApi = {
  register: (data: RegisterData): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/register', data).then(res => res.data),
  
  login: (data: LoginData): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/login', data).then(res => res.data),
  
  verifyEmail: (token: string): Promise<ApiResponse<void>> =>
    api.post('/auth/verify-email', { token }).then(res => res.data),
  
  getProfile: (): Promise<ApiResponse<{ user: User }>> =>
    api.get('/auth/profile').then(res => res.data),
}

// 评论API
export const commentApi = {
  getComments: (resourceType: string, resourceId: string): Promise<ApiResponse<{ comments: Comment[], total: number }>> =>
    api.get(`/comments/${resourceType}/${resourceId}`).then(res => res.data),
  
  createComment: (data: CommentCreate): Promise<ApiResponse<{ comment: Comment }>> =>
    api.post('/comments', data).then(res => res.data),
  
  updateComment: (commentId: string, content: string): Promise<ApiResponse<{ comment: Partial<Comment> }>> =>
    api.put(`/comments/${commentId}`, { content }).then(res => res.data),
  
  deleteComment: (commentId: string): Promise<ApiResponse<void>> =>
    api.delete(`/comments/${commentId}`).then(res => res.data),
}

// 点赞API
export const likeApi = {
  toggleLike: (data: LikeToggle): Promise<ApiResponse<{ isLiked: boolean, likeCount: number }>> =>
    api.post('/likes/toggle', data).then(res => res.data),
  
  getLikeStatus: (resourceType: string, resourceId: string): Promise<ApiResponse<LikeStatus>> =>
    api.get(`/likes/status/${resourceType}/${resourceId}`).then(res => res.data),
  
  getUserLikes: (params?: { page?: number, limit?: number, resourceType?: string }): Promise<ApiResponse<any>> =>
    api.get('/likes/user', { params }).then(res => res.data),
}

// 翻译 API
export const translateApi = {
  translate: async (text: string, targetLang: string = 'ZH'): Promise<ApiResponse<{ translatedText: string }>> => {
    const response = await api.post('/translate', { text, target_lang: targetLang.toUpperCase() });
    return response.data;
  }
}

// 设置认证token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}