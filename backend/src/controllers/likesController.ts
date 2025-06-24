import { Context } from 'hono'
import { createSupabaseClient } from '../config/database'

export class LikesController {
  /**
   * 切换点赞状态 (点赞/取消点赞)
   */
  static async toggleLike(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json({
          success: false,
          message: '请先登录'
        }, 401)
      }

      const { resourceType, resourceId } = await c.req.json()

      if (!resourceType || !resourceId) {
        return c.json({
          success: false,
          message: '资源类型和资源ID不能为空'
        }, 400)
      }

      if (!['news', 'comment'].includes(resourceType)) {
        return c.json({
          success: false,
          message: '不支持的资源类型'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 验证资源是否存在
      if (resourceType === 'news') {
        const { data: news, error: newsError } = await supabaseAdmin
          .from('news')
          .select('id')
          .eq('id', resourceId)
          .single()

        if (newsError || !news) {
          return c.json({
            success: false,
            message: '新闻不存在'
          }, 400)
        }
      } else if (resourceType === 'comment') {
        const { data: comment, error: commentError } = await supabaseAdmin
          .from('comments')
          .select('id')
          .eq('id', resourceId)
          .eq('is_deleted', false)
          .single()

        if (commentError || !comment) {
          return c.json({
            success: false,
            message: '评论不存在'
          }, 400)
        }
      }

      // 检查是否已经点赞
      const { data: existingLike, error: likeError } = await supabaseAdmin
        .from('likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('resource_type', resourceType)
        .eq('resource_id', resourceId)
        .single()

      let isLiked = false
      let likeCount = 0

      if (existingLike) {
        // 已点赞，执行取消点赞
        const { error: deleteError } = await supabaseAdmin
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        if (deleteError) {
          console.error('取消点赞失败:', deleteError)
          return c.json({
            success: false,
            message: '取消点赞失败'
          }, 500)
        }

        isLiked = false
      } else {
        // 未点赞，执行点赞
        const { error: insertError } = await supabaseAdmin
          .from('likes')
          .insert({
            user_id: user.id,
            resource_type: resourceType,
            resource_id: resourceId
          })

        if (insertError) {
          console.error('点赞失败:', insertError)
          return c.json({
            success: false,
            message: '点赞失败'
          }, 500)
        }

        isLiked = true
      }

      // 获取最新的点赞数量
      if (resourceType === 'comment') {
        const { data: comment, error: commentError } = await supabaseAdmin
          .from('comments')
          .select('like_count')
          .eq('id', resourceId)
          .single()

        if (!commentError && comment) {
          likeCount = comment.like_count
        }
      } else if (resourceType === 'news') {
        // 计算新闻的点赞数量
        const { count, error: countError } = await supabaseAdmin
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('resource_type', 'news')
          .eq('resource_id', resourceId)

        if (!countError) {
          likeCount = count || 0
        }
      }

      return c.json({
        success: true,
        message: isLiked ? '点赞成功' : '取消点赞成功',
        data: {
          isLiked,
          likeCount
        }
      })

    } catch (error) {
      console.error('切换点赞状态错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 获取资源的点赞状态和数量
   */
  static async getLikeStatus(c: Context) {
    try {
      const resourceType = c.req.param('resourceType')
      const resourceId = c.req.param('resourceId')
      
      if (!resourceType || !resourceId) {
        return c.json({
          success: false,
          message: '缺少资源类型或资源ID'
        }, 400)
      }

      if (!['news', 'comment'].includes(resourceType)) {
        return c.json({
          success: false,
          message: '不支持的资源类型'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)
      const user = c.get('user') // 可选的用户信息

      let likeCount = 0
      let isLiked = false

      // 获取点赞数量
      if (resourceType === 'comment') {
        const { data: comment, error: commentError } = await supabaseAdmin
          .from('comments')
          .select('like_count')
          .eq('id', resourceId)
          .single()

        if (!commentError && comment) {
          likeCount = comment.like_count
        }
      } else if (resourceType === 'news') {
        const { count, error: countError } = await supabaseAdmin
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('resource_type', 'news')
          .eq('resource_id', resourceId)

        if (!countError) {
          likeCount = count || 0
        }
      }

      // 如果用户已登录，检查是否已点赞
      if (user) {
        const { data: userLike, error: userLikeError } = await supabaseAdmin
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('resource_type', resourceType)
          .eq('resource_id', resourceId)
          .single()

        if (!userLikeError && userLike) {
          isLiked = true
        }
      }

      return c.json({
        success: true,
        data: {
          likeCount,
          isLiked,
          requiresAuth: !user
        }
      })

    } catch (error) {
      console.error('获取点赞状态错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 获取用户的点赞列表
   */
  static async getUserLikes(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json({
          success: false,
          message: '请先登录'
        }, 401)
      }

      const page = parseInt(c.req.query('page') || '1')
      const limit = Math.min(parseInt(c.req.query('limit') || '20'), 100)
      const resourceType = c.req.query('resourceType') // 可选筛选条件

      const { supabaseAdmin } = createSupabaseClient(c.env)

      let query = supabaseAdmin
        .from('likes')
        .select(`
          id,
          resource_type,
          resource_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (resourceType && ['news', 'comment'].includes(resourceType)) {
        query = query.eq('resource_type', resourceType)
      }

      const { data: likes, error: likesError } = await query
        .range((page - 1) * limit, page * limit - 1)

      if (likesError) {
        console.error('获取用户点赞列表失败:', likesError)
        return c.json({
          success: false,
          message: '获取点赞列表失败'
        }, 500)
      }

      // 获取总数
      let countQuery = supabaseAdmin
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (resourceType && ['news', 'comment'].includes(resourceType)) {
        countQuery = countQuery.eq('resource_type', resourceType)
      }

      const { count: totalCount } = await countQuery

      return c.json({
        success: true,
        data: {
          likes,
          pagination: {
            page,
            limit,
            total: totalCount || 0,
            totalPages: Math.ceil((totalCount || 0) / limit)
          }
        }
      })

    } catch (error) {
      console.error('获取用户点赞列表错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }
}