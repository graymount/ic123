import { Router } from 'express'
import { globalSearch, getSearchSuggestions } from '../controllers/searchController'

const router = Router()

router.get('/', globalSearch)
router.get('/suggestions', getSearchSuggestions)

export default router