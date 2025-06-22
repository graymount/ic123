import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取所有网站
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('websites')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      return c.json({
        success: false,
        message: '获取网站失败'
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