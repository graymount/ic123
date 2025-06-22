import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取新闻列表
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    // 支持查询参数
    const search = c.req.query('search')
    const category = c.req.query('category')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const featured = c.req.query('featured')
    
    let query = supabase
      .from('news')
      .select('*')

    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,source.ilike.%${search}%`)
    }

    // 分类过滤
    if (category) {
      query = query.eq('category', category)
    }

    // 推荐过滤
    if (featured !== undefined) {
      query = query.eq('is_featured', featured === 'true')
    }

    // 分页
    const offset = (page - 1) * limit
    query = query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取新闻失败',
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

// 获取新闻分类
app.get('/categories', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('news')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取分类失败',
        error: error.message
      }, 500)
    }

    // 去重并排序
    const categories = [...new Set(data.map(item => item.category))].sort()

    return c.json({
      success: true,
      data: categories
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

// 根据ID获取新闻详情
app.get('/:id', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return c.json({
        success: false,
        message: '新闻不存在'
      }, 404)
    }

    return c.json({
      success: true,
      data
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

// 记录新闻浏览
app.post('/:id/view', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    // 先获取当前浏览计数
    const { data: news, error: fetchError } = await supabase
      .from('news')
      .select('view_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      return c.json({
        success: false,
        message: '新闻不存在'
      }, 404)
    }

    // 更新浏览计数
    const { error } = await supabase
      .from('news')
      .update({ 
        view_count: (news.view_count || 0) + 1
      })
      .eq('id', id)

    if (error) {
      console.error('更新浏览计数失败:', error)
      return c.json({
        success: false,
        message: '记录浏览失败'
      }, 500)
    }

    return c.json({
      success: true,
      message: '浏览记录成功'
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

export default app