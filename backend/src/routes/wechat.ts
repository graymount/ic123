import { Router } from 'express'
import { getWechatAccounts, getWechatAccountById, recordWechatView } from '../controllers/wechatController'

const router = Router()

router.get('/', getWechatAccounts)
router.get('/:id', getWechatAccountById)
router.post('/:id/view', recordWechatView)

export default router