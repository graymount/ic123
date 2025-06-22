import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取所有分类
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      return c.json({
        success: false,
        message: '获取分类失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      data,
      count: data.length
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 获取分类统计信息（包含每个分类下的网站数量）
app.get('/stats', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (categoriesError) {
      return c.json({
        success: false,
        message: '获取分类失败',
        error: categoriesError.message
      }, 500)
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

    return c.json({
      success: true,
      data: categoriesWithStats,
      count: categoriesWithStats.length
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 根据ID获取分类
app.get('/:id', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      return c.json({
        success: false,
        message: '分类不存在'
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

export default app