import { Router } from 'express'
import { submitFeedback, getFeedbackTypes } from '../controllers/feedbackController'

const router = Router()

router.post('/', submitFeedback)
router.get('/types', getFeedbackTypes)

export default router