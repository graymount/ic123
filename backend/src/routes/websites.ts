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

export default app