import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 反馈提交验证schema
const feedbackSchema = z.object({
  type: z.enum(['website', 'wechat', 'bug', 'suggestion']),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容不能超过2000字符'),
  contact_info: z.string().max(200, '联系方式不能超过200字符').optional()
})

// 管理员查询参数验证schema
const adminQuerySchema = z.object({
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected']).optional(),
  type: z.enum(['website', 'wechat', 'bug', 'suggestion']).optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => Math.min(parseInt(val) || 10, 50)).optional()
})

// 管理员更新反馈状态schema
const updateFeedbackSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'approved', 'rejected']),
  admin_notes: z.string().max(1000, '管理员备注不能超过1000字符').optional()
})

// 提交反馈
app.post('/', zValidator('json', feedbackSchema), async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const validatedData = c.req.valid('json')

    const { data, error } = await supabase
      .from('user_feedback')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('提交反馈失败:', error)
      return c.json({
        success: false,
        message: '提交反馈失败'
      }, 500)
    }

    return c.json({
      success: true,
      message: '反馈提交成功，感谢您的建议！',
      data
    })
  } catch (error) {
    console.error('服务器内部错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 获取反馈类型列表
app.get('/types', async (c) => {
  const types = [
    { value: 'website', label: '推荐网站' },
    { value: 'wechat', label: '推荐公众号' },
    { value: 'bug', label: '问题反馈' },
    { value: 'suggestion', label: '功能建议' }
  ]

  return c.json({
    success: true,
    data: types
  })
})

// 管理员获取反馈列表
app.get('/admin', zValidator('query', adminQuerySchema), async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const { status, type, page = 1, limit = 10 } = c.req.valid('query')
    
    let query = supabase
      .from('user_feedback')
      .select('*', { count: 'exact' })
    
    // 添加筛选条件
    if (status) {
      query = query.eq('status', status)
    }
    if (type) {
      query = query.eq('type', type)
    }
    
    // 分页和排序
    query = query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    const { data, error, count } = await query

    if (error) {
      console.error('获取反馈列表失败:', error)
      return c.json({
        success: false,
        message: '获取反馈列表失败'
      }, 500)
    }

    return c.json({
      success: true,
      data: {
        feedbacks: data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('服务器内部错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 管理员更新反馈状态
app.patch('/admin/:id', zValidator('json', updateFeedbackSchema), async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')
    const updateData = c.req.valid('json')

    const { data, error } = await supabase
      .from('user_feedback')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新反馈状态失败:', error)
      return c.json({
        success: false,
        message: '更新反馈状态失败'
      }, 500)
    }

    if (!data) {
      return c.json({
        success: false,
        message: '反馈不存在'
      }, 404)
    }

    return c.json({
      success: true,
      message: '反馈状态更新成功',
      data
    })
  } catch (error) {
    console.error('服务器内部错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误'
    }, 500)
  }
})

// 管理员获取反馈统计信息
app.get('/admin/stats', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    // 获取各状态的反馈数量
    const { data: statusStats, error: statusError } = await supabase
      .from('user_feedback')
      .select('status')
    
    if (statusError) {
      throw statusError
    }
    
    // 获取各类型的反馈数量
    const { data: typeStats, error: typeError } = await supabase
      .from('user_feedback')
      .select('type')
    
    if (typeError) {
      throw typeError
    }
    
    // 统计数据
    const statusCount = statusStats.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const typeCount = typeStats.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return c.json({
      success: true,
      data: {
        statusStats: statusCount,
        typeStats: typeCount,
        total: statusStats.length
      }
    })
  } catch (error) {
    console.error('获取统计信息失败:', error)
    return c.json({
      success: false,
      message: '获取统计信息失败'
    }, 500)
  }
})

export default app