import { Context, Next } from 'hono'
import { JWTUtils } from '../utils/auth'
import { createSupabaseClient } from '../config/database'

/**
 * JWT认证中间件
 */
export async function authMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const token = JWTUtils.extractTokenFromHeader(authHeader)

    if (!token) {
      return c.json({
        success: false,
        message: '缺少认证token'
      }, 401)
    }

    // 验证JWT token
    const payload = await JWTUtils.verifyToken(token)
    
    // 验证用户是否存在且活跃
    const { supabaseAdmin } = createSupabaseClient(c.env)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, is_active')
      .eq('id', payload.userId)
      .single()

    if (error || !user || !user.is_active) {
      return c.json({
        success: false,
        message: '无效的认证信息'
      }, 401)
    }

    // 将用户信息存储在上下文中
    c.set('user', {
      id: user.id,
      email: user.email,
      username: user.username
    })

    await next()
  } catch (error) {
    console.error('认证中间件错误:', error)
    return c.json({
      success: false,
      message: '认证失败'
    }, 401)
  }
}

/**
 * 可选认证中间件 - 用于可登录可不登录的接口
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization')
    const token = JWTUtils.extractTokenFromHeader(authHeader)

    if (token) {
      // 如果有token，验证并设置用户信息
      const payload = await JWTUtils.verifyToken(token)
      const { supabaseAdmin } = createSupabaseClient(c.env)
      
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, username, is_active')
        .eq('id', payload.userId)
        .single()

      if (!error && user && user.is_active) {
        c.set('user', {
          id: user.id,
          email: user.email,
          username: user.username
        })
      }
    }

    await next()
  } catch (error) {
    // 可选认证失败时继续执行，不返回错误
    await next()
  }
}