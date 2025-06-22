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

// 获取分类统计信息（包含每个分类下的网站数量）
export const getCategoriesWithStats = asyncHandler(async (req: Request, res: Response) => {
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    throw new AppError('获取分类失败', 500)
  }

  // 获取每个分类的网站数量
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const { count, error } = await supabase
        .from('websites')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)
        .eq('is_active', true)

      if (error) {
        console.error('获取分类统计失败:', error)
        return { ...category, website_count: 0 }
      }

      return { ...category, website_count: count || 0 }
    })
  )

  res.json({
    success: true,
    data: categoriesWithStats,
    count: categoriesWithStats.length
  })
})

// 获取热门分类（按网站数量排序）
export const getPopularCategories = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 10

  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      websites!category_id (count)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (error) {
    throw new AppError('获取热门分类失败', 500)
  }

  res.json({
    success: true,
    data,
    count: data.length
  })
})