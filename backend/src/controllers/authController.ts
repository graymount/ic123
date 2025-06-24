import { Context } from 'hono'
import { createSupabaseClient } from '../config/database'
import { PasswordUtils, JWTUtils, EmailUtils, ValidationUtils } from '../utils/auth'

export class AuthController {
  /**
   * 用户注册
   */
  static async register(c: Context) {
    try {
      const { email, password, username, displayName } = await c.req.json()
      
      // 验证输入数据
      if (!email || !password || !username) {
        return c.json({
          success: false,
          message: '邮箱、密码和用户名不能为空'
        }, 400)
      }

      if (!EmailUtils.isValidEmail(email)) {
        return c.json({
          success: false,
          message: '邮箱格式不正确'
        }, 400)
      }

      if (!ValidationUtils.isValidUsername(username)) {
        return c.json({
          success: false,
          message: '用户名格式不正确，请使用3-20位字母、数字、下划线或中文'
        }, 400)
      }

      if (!ValidationUtils.isValidPassword(password)) {
        return c.json({
          success: false,
          message: '密码至少8位，需包含字母和数字'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 检查邮箱是否已存在
      const { data: existingEmailUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingEmailUser) {
        return c.json({
          success: false,
          message: '该邮箱已被注册'
        }, 400)
      }

      // 检查用户名是否已存在
      const { data: existingUsernameUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUsernameUser) {
        return c.json({
          success: false,
          message: '该用户名已被使用'
        }, 400)
      }

      // 哈希密码
      const passwordHash = await PasswordUtils.hashPassword(password)

      // 创建用户
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          username,
          display_name: displayName || username,
          is_verified: false,
          is_active: true
        })
        .select('id, email, username, display_name, is_verified, created_at')
        .single()

      if (userError) {
        console.error('用户创建失败:', userError)
        return c.json({
          success: false,
          message: '用户创建失败'
        }, 500)
      }

      // 生成邮箱验证token
      const verificationToken = EmailUtils.generateVerificationToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期

      await supabaseAdmin
        .from('email_verifications')
        .insert({
          user_id: newUser.id,
          token: verificationToken,
          expires_at: expiresAt.toISOString()
        })

      // 生成JWT token
      const jwtToken = await JWTUtils.generateToken({
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username
      })

      return c.json({
        success: true,
        message: '注册成功，请查收邮箱验证邮件',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            displayName: newUser.display_name,
            isVerified: newUser.is_verified,
            createdAt: newUser.created_at
          },
          token: jwtToken,
          verificationToken // 开发环境返回，生产环境应通过邮件发送
        }
      })

    } catch (error) {
      console.error('注册错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 用户登录
   */
  static async login(c: Context) {
    try {
      const { email, password } = await c.req.json()

      if (!email || !password) {
        return c.json({
          success: false,
          message: '邮箱和密码不能为空'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 查找用户
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('id, email, password_hash, username, display_name, is_verified, is_active')
        .eq('email', email)
        .single()

      if (userError || !user) {
        return c.json({
          success: false,
          message: '邮箱或密码错误'
        }, 401)
      }

      if (!user.is_active) {
        return c.json({
          success: false,
          message: '账户已被禁用'
        }, 401)
      }

      // 验证密码
      const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password_hash)
      if (!isPasswordValid) {
        return c.json({
          success: false,
          message: '邮箱或密码错误'
        }, 401)
      }

      // 更新最后登录时间
      await supabaseAdmin
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id)

      // 生成JWT token
      const jwtToken = await JWTUtils.generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      })

      return c.json({
        success: true,
        message: '登录成功',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.display_name,
            isVerified: user.is_verified
          },
          token: jwtToken
        }
      })

    } catch (error) {
      console.error('登录错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 验证邮箱
   */
  static async verifyEmail(c: Context) {
    try {
      const { token } = await c.req.json()

      if (!token) {
        return c.json({
          success: false,
          message: '验证token不能为空'
        }, 400)
      }

      const { supabaseAdmin } = createSupabaseClient(c.env)

      // 查找验证记录
      const { data: verification, error: verificationError } = await supabaseAdmin
        .from('email_verifications')
        .select('id, user_id, expires_at, verified_at')
        .eq('token', token)
        .single()

      if (verificationError || !verification) {
        return c.json({
          success: false,
          message: '无效的验证token'
        }, 400)
      }

      if (verification.verified_at) {
        return c.json({
          success: false,
          message: '邮箱已经验证过了'
        }, 400)
      }

      if (new Date() > new Date(verification.expires_at)) {
        return c.json({
          success: false,
          message: '验证token已过期'
        }, 400)
      }

      // 更新用户验证状态
      const { error: updateUserError } = await supabaseAdmin
        .from('users')
        .update({ is_verified: true })
        .eq('id', verification.user_id)

      if (updateUserError) {
        console.error('更新用户验证状态失败:', updateUserError)
        return c.json({
          success: false,
          message: '验证失败'
        }, 500)
      }

      // 标记验证记录为已验证
      await supabaseAdmin
        .from('email_verifications')
        .update({ verified_at: new Date().toISOString() })
        .eq('id', verification.id)

      return c.json({
        success: true,
        message: '邮箱验证成功'
      })

    } catch (error) {
      console.error('邮箱验证错误:', error)
      return c.json({
        success: false,
        message: '服务器内部错误'
      }, 500)
    }
  }

  /**
   * 获取用户信息
   */
  static async profile(c: Context) {
    try {
      const authHeader = c.req.header('Authorization')
      const token = JWTUtils.extractTokenFromHeader(authHeader)

      if (!token) {
        return c.json({
          success: false,
          message: '缺少认证token'
        }, 401)
      }

      const payload = await JWTUtils.verifyToken(token)
      const { supabaseAdmin } = createSupabaseClient(c.env)

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, username, display_name, avatar_url, is_verified, created_at')
        .eq('id', payload.userId)
        .single()

      if (error || !user) {
        return c.json({
          success: false,
          message: '用户不存在'
        }, 404)
      }

      return c.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            isVerified: user.is_verified,
            createdAt: user.created_at
          }
        }
      })

    } catch (error) {
      console.error('获取用户信息错误:', error)
      return c.json({
        success: false,
        message: '认证失败'
      }, 401)
    }
  }
}