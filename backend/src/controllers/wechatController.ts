import { Request, Response } from 'express'
import { supabase } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const getWechatAccounts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    search, 
    page = '1', 
    limit = '20',
    verified = 'all'
  } = req.query

  let query = supabase
    .from('wechat_accounts')
    .select('*')
    .eq('is_active', true)

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,positioning.ilike.%${search}%`)
  }

  if (verified === 'true') {
    query = query.eq('is_verified', true)
  } else if (verified === 'false') {
    query = query.eq('is_verified', false)
  }

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)
  const offset = (pageNum - 1) * limitNum

  const { data, error, count } = await query
    .order('follower_count', { ascending: false, nullsFirst: false })
    .order('name', { ascending: true })
    .range(offset, offset + limitNum - 1)

  if (error) {
    throw new AppError('获取公众号列表失败', 500)
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

export const getWechatAccountById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('wechat_accounts')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    throw new AppError('公众号不存在', 404)
  }

  res.json({
    success: true,
    data
  })
})

export const recordWechatView = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  
  // 检查公众号是否存在
  const { data: account, error: fetchError } = await supabase
    .from('wechat_accounts')
    .select('id')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (fetchError || !account) {
    throw new AppError('公众号不存在', 404)
  }

  // 记录访问统计
  const { error: visitError } = await supabase
    .from('visit_stats')
    .insert({
      resource_type: 'wechat',
      resource_id: id,
      visitor_ip: req.ip,
      user_agent: req.get('User-Agent'),
      referer: req.get('Referer')
    })

  if (visitError) {
    console.error('记录访问统计失败:', visitError)
  }

  res.json({
    success: true,
    message: '查看记录成功'
  })
})