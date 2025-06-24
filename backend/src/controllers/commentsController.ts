import { Context } from 'hono'
import { createSupabaseClient } from '../config/database'

export class CommentsController {
  /**
   * 获取资源的评论列表
   */
  static async getComments(c: Context) {
    try {
      const resourceType = c.req.param('resourceType')
      const resourceId = c.req.param('resourceId')
      
      if (!resourceType || !resourceId) {
        return c.json({
          success: false,
          message: '缺少资源类型或资源ID'
        }, 400)
      }

      if (resourceType !== 'news') {
        return c.json({
          success: false,
          message: '当前只支持新闻评论'
        }, 400)
      }

      const { supabase } = createSupabaseClient(c.env)

      // 使用RPC函数获取带用户信息的评论
      const { data: comments, error } = await supabase
        .rpc('get_comments_with_user_info', {
          target_resource_type: resourceType,
          target_resource_id: resourceId
        })

      if (error) {
        console.error('获取评论失败:', error)
        return c.json({
          success: false,
          message: '获取评论失败'
        }, 500)
      }

      // 组织评论数据为树形结构
      const commentMap = new Map()
      const rootComments: any[] = []

      // 先创建所有评论的映射
      comments.forEach((comment: any) => {
        commentMap.set(comment.id, {
          id: comment.id,
          content: comment.content,
          likeCount: comment.like_count,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          user: {
            id: comment.user_id,
            username: comment.username,
            displayName: comment.display_name,
            avatarUrl: comment.avatar_url
          },
          replies: []
        })
      })

      // 构建树形结构
      comments.forEach((comment: any) => {
        const commentObj = commentMap.get(comment.id)
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies.push(commentObj)
          }
        } else {
          rootComments.push(commentObj)
        }
      })

      return c.json({
        success: true,
        data: {
          comments: rootComments,
          total: comments.length
        }
      })

    } catch (error) {
      console.error('获取评论错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 创建评论
   */
  static async createComment(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json({
          success: false,
          message: '请先登录'
        }, 401)
      }

      const { resourceType, resourceId, content, parentId } = await c.req.json()

      if (!resourceType || !resourceId || !content) {
        return c.json({
          success: false,
          message: '资源类型、资源ID和评论内容不能为空'
        }, 400)
      }

      if (resourceType !== 'news') {
        return c.json({
          success: false,
          message: '当前只支持新闻评论'
        }, 400)
      }

      if (content.trim().length < 1 || content.trim().length > 1000) {
        return c.json({
          success: false,
          message: '评论内容长度必须在1-1000字符之间'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 如果是回复评论，验证父评论是否存在
      if (parentId) {
        const { data: parentComment, error: parentError } = await supabaseAdmin
          .from('comments')
          .select('id')
          .eq('id', parentId)
          .eq('resource_type', resourceType)
          .eq('resource_id', resourceId)
          .eq('is_deleted', false)
          .single()

        if (parentError || !parentComment) {
          return c.json({
            success: false,
            message: '父评论不存在'
          }, 400)
        }
      }

      // 验证资源是否存在（以新闻为例）
      const { data: news, error: newsError } = await supabaseAdmin
        .from('news')
        .select('id')
        .eq('id', resourceId)
        .single()

      if (newsError || !news) {
        return c.json({
          success: false,
          message: '资源不存在'
        }, 400)
      }

      // 创建评论
      const { data: newComment, error: createError } = await supabaseAdmin
        .from('comments')
        .insert({
          user_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
          content: content.trim(),
          parent_id: parentId || null
        })
        .select(`
          id,
          content,
          parent_id,
          like_count,
          created_at,
          updated_at
        `)
        .single()

      if (createError) {
        console.error('创建评论失败:', createError)
        return c.json({
          success: false,
          message: '创建评论失败'
        }, 500)
      }

      // 获取用户信息
      const { data: userInfo, error: userError } = await supabaseAdmin
        .from('users')
        .select('username, display_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('获取用户信息失败:', userError)
      }

      return c.json({
        success: true,
        message: '评论创建成功',
        data: {
          comment: {
            id: newComment.id,
            content: newComment.content,
            parentId: newComment.parent_id,
            likeCount: newComment.like_count,
            createdAt: newComment.created_at,
            updatedAt: newComment.updated_at,
            user: {
              id: user.id,
              username: userInfo?.username,
              displayName: userInfo?.display_name,
              avatarUrl: userInfo?.avatar_url
            }
          }
        }
      })

    } catch (error) {
      console.error('创建评论错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 删除评论（软删除）
   */
  static async deleteComment(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json({
          success: false,
          message: '请先登录'
        }, 401)
      }

      const commentId = c.req.param('commentId')
      if (!commentId) {
        return c.json({
          success: false,
          message: '缺少评论ID'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 检查评论是否存在且属于当前用户
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('comments')
        .select('id, user_id, is_deleted')
        .eq('id', commentId)
        .single()

      if (commentError || !comment) {
        return c.json({
          success: false,
          message: '评论不存在'
        }, 404)
      }

      if (comment.is_deleted) {
        return c.json({
          success: false,
          message: '评论已被删除'
        }, 400)
      }

      if (comment.user_id !== user.id) {
        return c.json({
          success: false,
          message: '只能删除自己的评论'
        }, 403)
      }

      // 软删除评论
      const { error: deleteError } = await supabaseAdmin
        .from('comments')
        .update({ is_deleted: true })
        .eq('id', commentId)

      if (deleteError) {
        console.error('删除评论失败:', deleteError)
        return c.json({
          success: false,
          message: '删除评论失败'
        }, 500)
      }

      return c.json({
        success: true,
        message: '评论删除成功'
      })

    } catch (error) {
      console.error('删除评论错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 更新评论
   */
  static async updateComment(c: Context) {
    try {
      const user = c.get('user')
      if (!user) {
        return c.json({
          success: false,
          message: '请先登录'
        }, 401)
      }

      const commentId = c.req.param('commentId')
      const { content } = await c.req.json()

      if (!commentId) {
        return c.json({
          success: false,
          message: '缺少评论ID'
        }, 400)
      }

      if (!content || content.trim().length < 1 || content.trim().length > 1000) {
        return c.json({
          success: false,
          message: '评论内容长度必须在1-1000字符之间'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 检查评论是否存在且属于当前用户
      const { data: comment, error: commentError } = await supabaseAdmin
        .from('comments')
        .select('id, user_id, is_deleted')
        .eq('id', commentId)
        .single()

      if (commentError || !comment) {
        return c.json({
          success: false,
          message: '评论不存在'
        }, 404)
      }

      if (comment.is_deleted) {
        return c.json({
          success: false,
          message: '已删除的评论无法编辑'
        }, 400)
      }

      if (comment.user_id !== user.id) {
        return c.json({
          success: false,
          message: '只能编辑自己的评论'
        }, 403)
      }

      // 更新评论
      const { data: updatedComment, error: updateError } = await supabaseAdmin
        .from('comments')
        .update({ content: content.trim() })
        .eq('id', commentId)
        .select('id, content, updated_at')
        .single()

      if (updateError) {
        console.error('更新评论失败:', updateError)
        return c.json({
          success: false,
          message: '更新评论失败'
        }, 500)
      }

      return c.json({
        success: true,
        message: '评论更新成功',
        data: {
          comment: {
            id: updatedComment.id,
            content: updatedComment.content,
            updatedAt: updatedComment.updated_at
          }
        }
      })

    } catch (error) {
      console.error('更新评论错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }
}