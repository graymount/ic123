import { Router } from 'express'
import categoriesRoutes from './categories'
import websitesRoutes from './websites'
import newsRoutes from './news'
import wechatRoutes from './wechat'
import searchRoutes from './search'
import feedbackRoutes from './feedback'

const router = Router()

router.use('/categories', categoriesRoutes)
router.use('/websites', websitesRoutes)
router.use('/news', newsRoutes)
router.use('/wechat', wechatRoutes)
router.use('/search', searchRoutes)
router.use('/feedback', feedbackRoutes)

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'IC123 API is running',
    timestamp: new Date().toISOString()
  })
})

export default router