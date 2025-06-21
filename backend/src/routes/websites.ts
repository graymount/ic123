import { Router } from 'express'
import { getWebsites, getWebsiteById, recordWebsiteVisit } from '../controllers/websitesController'

const router = Router()

router.get('/', getWebsites)
router.get('/:id', getWebsiteById)
router.post('/:id/visit', recordWebsiteVisit)

export default router