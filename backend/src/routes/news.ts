import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取新闻列表
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50)

    if (error) {
      return c.json({
        success: false,
        message: '获取新闻失败'
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

export default app