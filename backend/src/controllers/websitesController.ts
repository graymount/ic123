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

// 管理员接口：批量更新网站分类
export const updateWebsiteCategories = asyncHandler(async (req: Request, res: Response) => {
  const updates = req.body.updates as Array<{ id: string; category_id: string }>
  
  if (!Array.isArray(updates)) {
    throw new AppError('请提供有效的更新数据', 400)
  }

  const results = []
  
  for (const update of updates) {
    try {
      const { data, error } = await supabaseAdmin
        .from('websites')
        .update({ category_id: update.category_id })
        .eq('id', update.id)
        .select('id, name, category_id')
        .single()
      
      if (error) {
        results.push({ id: update.id, success: false, error: error.message })
      } else {
        results.push({ id: update.id, success: true, data })
      }
    } catch (error) {
      results.push({ id: update.id, success: false, error: 'Unknown error' })
    }
  }

  res.json({
    success: true,
    message: `批量更新完成，成功: ${results.filter(r => r.success).length}，失败: ${results.filter(r => !r.success).length}`,
    results
  })
})

// 管理员接口：根据网站特点自动分类
export const autoClassifyWebsites = asyncHandler(async (req: Request, res: Response) => {
  // 获取所有分类
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)

  if (!categories) {
    throw new AppError('获取分类失败', 500)
  }

  // 创建分类映射
  const categoryMap = new Map()
  categories.forEach(cat => {
    categoryMap.set(cat.name, cat.id)
  })

  // 获取所有未分类的网站
  const { data: websites } = await supabase
    .from('websites')
    .select('*')
    .is('category_id', null)
    .eq('is_active', true)

  if (!websites || websites.length === 0) {
    return res.json({
      success: true,
      message: '没有需要分类的网站',
      count: 0
    })
  }

  // 自动分类规则
  const classificationRules = [
    // EDA工具和设计
    {
      keywords: ['cadence', 'synopsys', 'mentor', 'eda', '设计工具', 'design', 'simulation'],
      category: '设计工具'
    },
    // 晶圆制造
    {
      keywords: ['tsmc', 'globalfoundries', 'smic', '台积电', '中芯', '晶圆', 'foundry', 'fab'],
      category: '制造封测'
    },
    // 设备材料
    {
      keywords: ['applied materials', 'asml', 'lam research', '设备', 'equipment', 'materials'],
      category: '设备材料'
    },
    // 新闻媒体
    {
      keywords: ['eetimes', '集微网', '电子工程世界', 'news', 'media', '新闻', '媒体'],
      category: '新闻媒体'
    },
    // 市场分析
    {
      keywords: ['ic insights', 'gartner', 'idc', 'research', 'analysis', '分析', '研究'],
      category: '市场分析'
    },
    // 行业协会和政策
    {
      keywords: ['协会', 'association', '政府', 'government', 'policy', '政策'],
      category: '政策法规'
    },
    // 技术社区
    {
      keywords: ['forum', 'community', '论坛', '社区', 'stackoverflow', 'github'],
      category: '技术社区'
    }
  ]

  const updates = []
  
  for (const website of websites) {
    const text = `${website.name} ${website.description} ${website.url}`.toLowerCase()
    
    for (const rule of classificationRules) {
      const hasKeyword = rule.keywords.some(keyword => text.includes(keyword.toLowerCase()))
      
      if (hasKeyword && categoryMap.has(rule.category)) {
        updates.push({
          id: website.id,
          category_id: categoryMap.get(rule.category),
          name: website.name,
          matched_rule: rule.category
        })
        break
      }
    }
  }

  // 执行批量更新
  const results = []
  for (const update of updates) {
    try {
      const { error } = await supabaseAdmin
        .from('websites')
        .update({ category_id: update.category_id })
        .eq('id', update.id)
      
      if (error) {
        results.push({ ...update, success: false, error: error.message })
      } else {
        results.push({ ...update, success: true })
      }
    } catch (error) {
      results.push({ ...update, success: false, error: 'Unknown error' })
    }
  }

  res.json({
    success: true,
    message: `自动分类完成，处理了 ${results.length} 个网站`,
    results,
    summary: {
      total: websites.length,
      classified: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      unclassified: websites.length - results.length
    }
  })
})