import { Request, Response } from 'express'
import { supabase } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'

export const globalSearch = asyncHandler(async (req: Request, res: Response) => {
  const { q: query, type = 'all' } = req.query

  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    throw new AppError('搜索关键词至少需要2个字符', 400)
  }

  const searchTerm = query.trim()
  const results: any = {
    websites: [],
    news: [],
    wechat: []
  }

  try {
    if (type === 'all' || type === 'websites') {
      const { data: websites } = await supabase
        .from('active_websites_with_category')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10)

      results.websites = websites || []
    }

    if (type === 'all' || type === 'news') {
      const { data: news } = await supabase
        .from('news')
        .select('id, title, summary, source, original_url, image_url, published_at, tags')
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
        .order('published_at', { ascending: false })
        .limit(10)

      results.news = news || []
    }

    if (type === 'all' || type === 'wechat') {
      const { data: wechat } = await supabase
        .from('wechat_accounts')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,positioning.ilike.%${searchTerm}%`)
        .limit(10)

      results.wechat = wechat || []
    }

    const totalResults = results.websites.length + results.news.length + results.wechat.length

    res.json({
      success: true,
      query: searchTerm,
      total: totalResults,
      data: results
    })

  } catch (error) {
    throw new AppError('搜索失败', 500)
  }
})

export const getSearchSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const { q: query } = req.query

  if (!query || typeof query !== 'string' || query.trim().length < 1) {
    return res.json({
      success: true,
      data: []
    })
  }

  const searchTerm = query.trim()
  const suggestions: string[] = []

  try {
    const [websiteSuggestions, newsSuggestions] = await Promise.all([
      supabase
        .from('websites')
        .select('name')
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .limit(5),
      
      supabase
        .from('news')
        .select('title')
        .ilike('title', `%${searchTerm}%`)
        .limit(5)
    ])

    if (websiteSuggestions.data) {
      suggestions.push(...websiteSuggestions.data.map(item => item.name))
    }

    if (newsSuggestions.data) {
      suggestions.push(...newsSuggestions.data.map(item => item.title))
    }

    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8)

    res.json({
      success: true,
      data: uniqueSuggestions
    })

  } catch (error) {
    throw new AppError('获取搜索建议失败', 500)
  }
  
  return // 确保所有代码路径都有返回值
})