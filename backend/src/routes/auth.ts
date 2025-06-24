import { Hono } from 'hono'
import { AuthController } from '../controllers/authController'

const auth = new Hono()

// 用户注册
auth.post('/register', AuthController.register)

// 用户登录
auth.post('/login', AuthController.login)

// 邮箱验证
auth.post('/verify-email', AuthController.verifyEmail)

// 获取用户信息
auth.get('/profile', AuthController.profile)

export default auth