import { Request, Response } from 'express'
import { supabase, supabaseAdmin } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const getWebsites = asyncHandler(async (req: Request, res: Response) => {
  const { 
    category_id, 
    search, 
    page = '1', 
    limit = '20',
    sort = 'name'
  } = req.query

  let query = supabase
    .from('active_websites_with_category')
    .select('*')

  if (category_id) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', category_id)
      .single()
    
    if (!category) {
      throw new AppError('分类不存在', 404)
    }
    
    query = supabase
      .from('websites')
      .select(`
        *,
        categories!inner(name, icon)
      `)
      .eq('category_id', category_id)
      .eq('is_active', true)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const offset = (pageNum - 1) * limitNum

  query = query.range(offset, offset + limitNum - 1)

  if (sort === 'visit_count') {
    query = query.order('visit_count', { ascending: false })
  } else if (sort === 'rating') {
    query = query.order('rating', { ascending: false })
  } else {
    query = query.order('name', { ascending: true })
  }

  const { data, error, count } = await query

  if (error) {
    throw new AppError('获取网站列表失败', 500)
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

export const getWebsiteById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('websites')
    .select(`
      *,
      categories(name, icon)
    `)
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    throw new AppError('网站不存在', 404)
  }

  res.json({
    success: true,
    data
  })
})

export const recordWebsiteVisit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const visitorIp = req.ip
  const userAgent = req.get('User-Agent')
  const referer = req.get('Referer')

  const { data: website } = await supabase
    .from('websites')
    .select('id')
    .eq('id', id)
    .single()

  if (!website) {
    throw new AppError('网站不存在', 404)
  }

  await Promise.all([
    supabaseAdmin
      .from('visit_stats')
      .insert({
        resource_type: 'website',
        resource_id: id,
        visitor_ip: visitorIp,
        user_agent: userAgent,
        referer: referer
      }),
    
    supabaseAdmin
      .rpc('increment_website_visit_count', { website_id: id })
  ])

  res.json({
    success: true,
    message: '访问记录已保存'
  })
})