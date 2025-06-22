import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 提交反馈
app.post('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const body = await c.req.json()
    
    const { type, content, contact } = body

    if (!type || !content) {
      return c.json({
        success: false,
        message: '反馈类型和内容不能为空'
      }, 400)
    }

    const { data, error } = await supabase
      .from('feedback')
      .insert([{
        type,
        content,
        contact,
        created_at: new Date().toISOString()
      }])
      .select()

    if (error) {
      return c.json({
        success: false,
        message: '提交反馈失败'
      }, 500)
    }

    return c.json({
      success: true,
      message: '反馈提交成功',
      data: data[0]
    })
  } catch (error) {
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

export default app