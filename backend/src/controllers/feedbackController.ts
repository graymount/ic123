import { Request, Response } from 'express'
import { supabase } from '../config/database'
import { asyncHandler, AppError } from '../middleware/errorHandler'
import { z } from 'zod'

const feedbackSchema = z.object({
  type: z.enum(['website', 'wechat', 'bug', 'suggestion']),
  title: z.string().min(1, '标题不能为空').max(200, '标题不能超过200字符'),
  content: z.string().min(1, '内容不能为空').max(2000, '内容不能超过2000字符'),
  contact_info: z.string().max(200, '联系方式不能超过200字符').optional()
})

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = feedbackSchema.parse(req.body)

  const { data, error } = await supabase
    .from('user_feedback')
    .insert([validatedData])
    .select()
    .single()

  if (error) {
    throw new AppError('提交反馈失败', 500)
  }

  res.status(201).json({
    success: true,
    message: '反馈提交成功，感谢您的建议！',
    data
  })
})

export const getFeedbackTypes = asyncHandler(async (req: Request, res: Response) => {
  const types = [
    { value: 'website', label: '推荐网站' },
    { value: 'wechat', label: '推荐公众号' },
    { value: 'bug', label: '问题反馈' },
    { value: 'suggestion', label: '功能建议' }
  ]

  res.json({
    success: true,
    data: types
  })
})