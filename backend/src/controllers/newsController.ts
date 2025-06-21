import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const getNews = asyncHandler(async (req: Request, res: Response) => {
  const { 
    category, 
    search, 
    page = '1', 
    limit = '20',
    featured = 'false'
  } = req.query

  let query = supabase
    .from('news')
    .select('*')

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
  }

  if (featured === 'true') {
    query = query.eq('is_featured', true)
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const offset = (pageNum - 1) * limitNum

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limitNum - 1)

  if (error) {
    throw new AppError('获取新闻列表失败', 500)
  }

  res.json({
    success: true,
    data,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      pages: Math.ceil((count || 0) / limitNum)
    }
  })
})

export const getNewsById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new AppError('新闻不存在', 404)
  }

  res.json({
    success: true,
    data
  })
})

export const recordNewsView = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const visitorIp = req.ip
  const userAgent = req.get('User-Agent')
  const referer = req.get('Referer')

  const { data: news } = await supabase
    .from('news')
    .select('id')
    .eq('id', id)
    .single()

  if (!news) {
    throw new AppError('新闻不存在', 404)
  }

  await Promise.all([
    supabaseAdmin
      .from('visit_stats')
      .insert({
        resource_type: 'news',
        resource_id: id,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referer: referer
      }),
    
    supabaseAdmin
      .rpc('increment_news_view_count', { news_id: id })
  ])

  res.json({
    success: true,
    message: '阅读记录已保存'
  })
})

export const getNewsCategories = asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('news')
    .select('category')
    .not('category', 'is', null)

  if (error) {
    throw new AppError('获取新闻分类失败', 500)
  }

  const categories = [...new Set(data.map(item => item.category))]

  res.json({
    success: true,
    data: categories
  })
})