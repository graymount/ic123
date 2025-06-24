import { Hono } from 'hono'
import { LikesController } from '../controllers/likesController'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware'

const likes = new Hono()

// 切换点赞状态 (需要登录)
likes.post('/toggle', authMiddleware, LikesController.toggleLike)

// 获取资源的点赞状态和数量 (可选登录，登录用户显示是否已点赞)
likes.get('/status/:resourceType/:resourceId', optionalAuthMiddleware, LikesController.getLikeStatus)

// 获取用户的点赞列表 (需要登录)
likes.get('/user', authMiddleware, LikesController.getUserLikes)

export default likes