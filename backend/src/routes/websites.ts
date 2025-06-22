import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取所有网站
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    // 支持查询参数
    const search = c.req.query('search')
    const category_id = c.req.query('category_id')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '30')
    const sort = c.req.query('sort') || 'rating'
    
    let query = supabase
      .from('websites')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon
        )
      `)
      .eq('is_active', true)

    // 搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,target_audience.ilike.%${search}%`)
    }

    // 分类过滤
    if (category_id) {
      query = query.eq('category_id', category_id)
    }

    // 排序
    switch (sort) {
      case 'rating':
        query = query.order('rating', { ascending: false })
        break
      case 'visits':
        query = query.order('visit_count', { ascending: false })
        break
      case 'name':
        query = query.order('name', { ascending: true })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // 分页
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取网站失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      data,
      count: data?.length || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 根据ID获取网站
app.get('/:id', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      return c.json({
        success: false,
        message: '网站不存在'
      }, 404)
    }

    return c.json({
      success: true,
      data
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 记录网站访问
app.post('/:id/visit', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    // 先获取当前访问计数
    const { data: website, error: fetchError } = await supabase
      .from('websites')
      .select('visit_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      return c.json({
        success: false,
        message: '网站不存在'
      }, 404)
    }

    // 更新访问计数
    const { error } = await supabase
      .from('websites')
      .update({ 
        visit_count: (website.visit_count || 0) + 1,
        last_visited_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      return c.json({
        success: false,
        message: '记录访问失败'
      }, 500)
    }

    return c.json({
      success: true,
      message: '访问记录成功'
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 管理员接口：自动分类网站
app.post('/admin/auto-classify', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    // 获取所有分类
    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)

    if (!categories) {
      return c.json({
        success: false,
        message: '获取分类失败'
      }, 500)
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
      return c.json({
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
        const { error } = await supabase
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

    return c.json({
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
  } catch (error) {
    console.error('自动分类错误:', error)
    return c.json({
      success: false,
      message: '自动分类失败',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 管理员接口：批量更新网站分类
app.post('/admin/update-categories', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const { updates } = await c.req.json()
    
    if (!Array.isArray(updates)) {
      return c.json({
        success: false,
        message: '请提供有效的更新数据'
      }, 400)
    }

    const results = []
    
    for (const update of updates) {
      try {
        const { data, error } = await supabase
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

    return c.json({
      success: true,
      message: `批量更新完成，成功: ${results.filter(r => r.success).length}，失败: ${results.filter(r => !r.success).length}`,
      results
    })
  } catch (error) {
    console.error('批量更新错误:', error)
    return c.json({
      success: false,
      message: '批量更新失败',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 管理员接口：更新网站信息
app.put('/admin/:id', async (c) => {
  try {
    const { supabase, supabaseAdmin } = createSupabaseClient(c.env)
    const id = c.req.param('id')
    const updateData = await c.req.json()
    
    // 验证网站是否存在
    const { data: existingWebsite, error: fetchError } = await supabase
      .from('websites')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existingWebsite) {
      return c.json({
        success: false,
        message: '网站不存在',
        error: fetchError?.message
      }, 404)
    }

    // 使用管理员权限更新网站信息
    const { data, error } = await supabaseAdmin
      .from('websites')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()
    
    if (error) {
      console.error('数据库更新错误:', error)
      return c.json({
        success: false,
        message: '更新网站失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      message: `网站 "${existingWebsite.name}" 更新成功`,
      data
    })
  } catch (error) {
    console.error('更新网站错误:', error)
    return c.json({
      success: false,
      message: '更新网站失败',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 管理员接口：创建新网站
app.post('/admin/create', async (c) => {
  try {
    const { supabase, supabaseAdmin } = createSupabaseClient(c.env)
    const websiteData = await c.req.json()
    
    // 验证必需字段
    if (!websiteData.name || !websiteData.url || !websiteData.description) {
      return c.json({
        success: false,
        message: '缺少必需字段：name, url, description'
      }, 400)
    }

    // 验证分类是否存在（如果提供了category_id）
    if (websiteData.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', websiteData.category_id)
        .single()

      if (categoryError || !category) {
        return c.json({
          success: false,
          message: '指定的分类不存在'
        }, 400)
      }
    }

    // 检查URL是否已存在
    const { data: existingWebsite } = await supabase
      .from('websites')
      .select('id, name, url')
      .eq('url', websiteData.url)
      .single()

    if (existingWebsite) {
      return c.json({
        success: false,
        message: `网站URL已存在：${existingWebsite.name} (${existingWebsite.url})`
      }, 409)
    }

    // 确保URL格式正确
    let formattedUrl = websiteData.url
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`
    }

    // 创建新网站
    const { data, error } = await supabaseAdmin
      .from('websites')
      .insert({
        name: websiteData.name,
        url: formattedUrl,
        description: websiteData.description,
        category_id: websiteData.category_id || null,
        target_audience: websiteData.target_audience || null,
        use_case: websiteData.use_case || null,
        is_active: true,
        visit_count: 0,
        rating: websiteData.rating || 0,
        tags: websiteData.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
    
    if (error) {
      console.error('数据库插入错误:', error)
      return c.json({
        success: false,
        message: '创建网站失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      message: `网站 "${websiteData.name}" 创建成功`,
      data
    })
  } catch (error) {
    console.error('创建网站错误:', error)
    return c.json({
      success: false,
      message: '创建网站失败',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

export default app