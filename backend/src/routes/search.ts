import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 搜索功能
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const query = c.req.query('q')
    
    if (!query) {
      return c.json({
        success: false,
        message: '搜索关键词不能为空'
      }, 400)
    }

    // 简单的搜索实现
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(20)

    if (error) {
      return c.json({
        success: false,
        message: '搜索失败'
      }, 500)
    }

    return c.json({
      success: true,
      data,
      count: data.length,
      query
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

export default app