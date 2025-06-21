import { Request, Response } from 'express'
import { supabase } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new AppError('获取分类失败', 500)
  }

  res.json({
    success: true,
    data,
    count: data.length
  })
})

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    throw new AppError('分类不存在', 404)
  }

  res.json({
    success: true,
    data
  })
})