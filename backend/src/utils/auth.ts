import { sign, verify } from 'hono/jwt'

// JWT相关配置
const JWT_SECRET = 'your-secret-key' // 实际使用时从环境变量获取
const JWT_EXPIRES_IN = '7d' // JWT过期时间

// 密码工具函数
export class PasswordUtils {
  /**
   * 使用Web Crypto API进行密码哈希
   */
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 验证密码
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hashedPassword
  }
}

// JWT工具函数
export class JWTUtils {
  /**
   * 生成JWT token
   */
  static async generateToken(payload: {
    userId: string
    email: string
    username: string
  }): Promise<string> {
    const tokenPayload = {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天后过期
    }
    
    return await sign(tokenPayload, JWT_SECRET)
  }

  /**
   * 验证JWT token
   */
  static async verifyToken(token: string): Promise<any> {
    try {
      return await verify(token, JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * 从Authorization header中提取token
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    return authHeader.substring(7)
  }
}

// 邮箱验证工具
export class EmailUtils {
  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 生成邮箱验证token
   */
  static generateVerificationToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}

// 用户名验证工具
export class ValidationUtils {
  /**
   * 验证用户名格式
   */
  static isValidUsername(username: string): boolean {
    // 用户名长度3-20字符，只允许字母、数字、下划线、中文
    const usernameRegex = /^[\w\u4e00-\u9fa5]{3,20}$/
    return usernameRegex.test(username)
  }

  /**
   * 验证密码强度
   */
  static isValidPassword(password: string): boolean {
    // 密码至少8位，包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password)
  }
}