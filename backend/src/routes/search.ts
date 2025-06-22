import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 全局搜索功能
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const query = c.req.query('q')
    const type = c.req.query('type') || 'all'
    
    if (!query || query.trim().length < 2) {
      return c.json({
        success: false,
        message: '搜索关键词至少需要2个字符'
      }, 400)
    }

    const searchTerm = query.trim()
    const results: any = {
      websites: [],
      news: [],
      wechat: []
    }

    // 搜索网站
    if (type === 'all' || type === 'websites') {
      const { data: websites } = await supabase
        .from('websites')
        .select(`
          *,
          categories:category_id (
            id,
            name,
            icon
          )
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,target_audience.ilike.%${searchTerm}%`)
        .limit(10)

      results.websites = websites || []
    }

    // 搜索新闻
    if (type === 'all' || type === 'news') {
      const { data: news } = await supabase
        .from('news')
        .select('id, title, summary, source, original_url, image_url, published_at, tags, view_count')
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
        .order('published_at', { ascending: false })
        .limit(10)

      results.news = news || []
    }

    // 搜索微信公众号
    if (type === 'all' || type === 'wechat') {
      const { data: wechat } = await supabase
        .from('wechat_accounts')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,positioning.ilike.%${searchTerm}%`)
        .limit(10)

      results.wechat = wechat || []
    }

    const totalResults = results.websites.length + results.news.length + results.wechat.length

    return c.json({
      success: true,
      query: searchTerm,
      total: totalResults,
      data: results
    })

  } catch (error) {
    console.error('搜索错误:', error)
    return c.json({
      success: false,
      message: '搜索失败'
    }, 500)
  }
})

// 搜索建议
app.get('/suggestions', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const query = c.req.query('q')

    if (!query || query.trim().length < 1) {
      return c.json({
        success: true,
        data: []
      })
    }

    const searchTerm = query.trim()
    const suggestions: string[] = []

    // 获取网站名称建议
    const { data: websiteSuggestions } = await supabase
      .from('websites')
      .select('name')
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`)
      .limit(5)

    // 获取新闻标题建议
    const { data: newsSuggestions } = await supabase
      .from('news')
      .select('title')
      .ilike('title', `%${searchTerm}%`)
      .limit(5)

    if (websiteSuggestions) {
      suggestions.push(...websiteSuggestions.map(item => item.name))
    }

    if (newsSuggestions) {
      suggestions.push(...newsSuggestions.map(item => item.title))
    }

    // 去重并限制数量
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 8)

    return c.json({
      success: true,
      data: uniqueSuggestions
    })

  } catch (error) {
    console.error('获取搜索建议失败:', error)
    return c.json({
      success: false,
      message: '获取搜索建议失败'
    }, 500)
  }
})

export default app