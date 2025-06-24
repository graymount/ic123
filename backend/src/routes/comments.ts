import { Hono } from 'hono'
import { CommentsController } from '../controllers/commentsController'
import { authMiddleware } from '../middleware/authMiddleware'

const comments = new Hono()

// 获取资源的评论列表 (公开接口)
comments.get('/:resourceType/:resourceId', CommentsController.getComments)

// 创建评论 (需要登录)
comments.post('/', authMiddleware, CommentsController.createComment)

// 更新评论 (需要登录)
comments.put('/:commentId', authMiddleware, CommentsController.updateComment)

// 删除评论 (需要登录)
comments.delete('/:commentId', authMiddleware, CommentsController.deleteComment)

export default comments