import { Hono } from 'hono'
import { auth } from './auth'
import { categories } from './categories'
import { websites } from './websites'
import { news } from './news'
import { likes } from './likes'
import { comments } from './comments'
import { feedback } from './feedback'
import { search } from './search'
import { wechat } from './wechat'
import { translateController } from '../controllers/translateController'

export const api = new Hono()

api.route('/auth', auth)
api.route('/categories', categories)
api.route('/websites', websites)
api.route('/news', news)
api.route('/likes', likes)
api.route('/comments', comments)
api.route('/feedback', feedback)
api.route('/search', search)
api.route('/wechat', wechat)
api.route('/translate', translateController)
