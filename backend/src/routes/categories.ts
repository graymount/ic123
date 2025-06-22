import { Hono } from 'hono'
import { supabase } from '../config/database'

const app = new Hono()

// 获取所有分类
app.get('/', async (c) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      return c.json({
        success: false,
        message: '获取分类失败'
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

// 根据ID获取分类
app.get('/:id', async (c) => {
  try {
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