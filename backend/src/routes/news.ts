import { Router } from 'express'
import { getNews, getNewsById, recordNewsView, getNewsCategories } from '../controllers/newsController'

const router = Router()

router.get('/', getNews)
router.get('/categories', getNewsCategories)
router.get('/:id', getNewsById)
router.post('/:id/view', recordNewsView)

export default router