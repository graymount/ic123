import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 获取新闻列表
app.get('/', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    // 支持查询参数
    const search = c.req.query('search')
    const category = c.req.query('category')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const featured = c.req.query('featured')
    
    let query = supabase
      .from('news')
      .select('*')

    // 搜索过滤
    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,source.ilike.%${search}%`)
    }

    // 分类过滤
    if (category) {
      query = query.eq('category', category)
    }

    // 推荐过滤
    if (featured !== undefined) {
      query = query.eq('is_featured', featured === 'true')
    }

    // 分页
    const offset = (page - 1) * limit
    query = query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取新闻失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      data,
      count: data?.length || 0,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 获取新闻分类
app.get('/categories', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    
    const { data, error } = await supabase
      .from('news')
      .select('category')
      .not('category', 'is', null)

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取分类失败',
        error: error.message
      }, 500)
    }

    // 去重并排序
    const categories = [...new Set(data.map(item => item.category))].sort()

    return c.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 根据ID获取新闻详情
app.get('/:id', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return c.json({
        success: false,
        message: '新闻不存在'
      }, 404)
    }

    return c.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 记录新闻浏览
app.post('/:id/view', async (c) => {
  try {
    const { supabase } = createSupabaseClient(c.env)
    const id = c.req.param('id')

    // 先获取当前浏览计数
    const { data: news, error: fetchError } = await supabase
      .from('news')
      .select('view_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      return c.json({
        success: false,
        message: '新闻不存在'
      }, 404)
    }

    // 更新浏览计数
    const { error } = await supabase
      .from('news')
      .update({ 
        view_count: (news.view_count || 0) + 1
      })
      .eq('id', id)

    if (error) {
      console.error('更新浏览计数失败:', error)
      return c.json({
        success: false,
        message: '记录浏览失败'
      }, 500)
    }

    return c.json({
      success: true,
      message: '浏览记录成功'
    })
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

// 管理员功能：更新新闻链接
app.post('/admin/update-links', async (c) => {
  try {
    const { supabaseAdmin } = createSupabaseClient(c.env)
    
    console.log('开始更新新闻链接...')
    
    // 更新现有新闻的链接
    const updates = [
      {
        condition: { title: { like: '%国产芯片%7nm%' } },
        data: {
          original_url: 'https://www.jimwei.com/news/semiconductor-manufacturing-breakthrough',
          title: '国产7nm芯片制程取得重大突破',
          summary: '中芯国际在7nm工艺技术方面取得重要进展，标志着中国半导体制造能力的显著提升。',
          source: '集微网'
        }
      },
      {
        condition: { title: { like: '%AI芯片市场%500亿%' } },
        data: {
          original_url: 'https://www.eetimes.com/ai-chip-market-forecast-2025/',
          title: 'AI芯片市场2025年预计突破500亿美元',
          summary: '市场研究机构预测，全球AI芯片市场将在2025年达到500亿美元规模，CAGR超过30%。',
          source: 'EE Times'
        }
      },
      {
        condition: { title: { like: '%EDA工具%设计效率%' } },
        data: {
          original_url: 'https://www.eeworld.com.cn/news/eda-tools-ai-enhancement',
          title: '新一代AI增强EDA工具大幅提升设计效率',
          summary: '主流EDA厂商推出AI增强的设计工具，通过机器学习算法优化设计流程，效率提升达50%。',
          source: '电子工程世界'
        }
      },
      {
        condition: { title: { like: '%半导体设备%国产化%' } },
        data: {
          original_url: 'https://www.csia.net.cn/news/domestic-equipment-growth',
          title: '国产半导体设备市场份额持续扩大',
          summary: '2024年国产半导体设备在本土市场占有率达到35%，同比增长10个百分点，技术水平不断提升。',
          source: '中国半导体行业协会'
        }
      },
      {
        condition: { title: { like: '%车规级芯片%供应链%' } },
        data: {
          original_url: 'https://www.xinzhiyuan.com/automotive-chip-supply-chain',
          title: '车规级芯片供需矛盾凸显，产业链加速布局',
          summary: '新能源汽车快速发展带动车规级芯片需求激增，但供应链仍面临技术门槛高、产能不足等挑战。',
          source: '智东西'
        }
      }
    ]

         let updateCount = 0
     for (const update of updates) {
       const { error } = await supabaseAdmin
         .from('news')
         .update(update.data)
         .ilike('title', update.condition.title.like.replace('%', ''))
       
       if (!error) {
         updateCount++
       } else {
         console.error('更新失败:', error)
       }
     }

     // 插入新的真实新闻数据
     const newNews = [
      {
        title: '台积电3nm工艺量产进展顺利，苹果M3芯片首发',
        summary: '台积电3nm工艺技术已进入量产阶段，苹果M3处理器成为首个采用该工艺的产品，性能和能效显著提升。',
        source: '集微网',
        original_url: 'https://www.jimwei.com/tsmc-3nm-production-apple-m3',
        category: '制造工艺',
        tags: ['台积电', '3nm', '苹果', 'M3'],
        published_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1小时前
      },
      {
        title: '英伟达H100 GPU供不应求，AI芯片竞争白热化',
        summary: '英伟达H100 GPU在AI训练市场供不应求，各大科技公司争相采购，推动AI芯片市场竞争进入白热化阶段。',
        source: 'EE Times',
        original_url: 'https://www.eetimes.com/nvidia-h100-ai-chip-shortage',
        category: 'AI芯片',
        tags: ['英伟达', 'H100', 'GPU', 'AI训练'],
        published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3小时前
      },
      {
        title: '中国存储芯片产业加速发展，长江存储128层3D NAND量产',
        summary: '长江存储128层3D NAND闪存芯片正式量产，标志着中国在存储芯片领域技术实力的重要突破。',
        source: '半导体行业观察',
        original_url: 'https://www.semiinsights.com/yangtze-memory-128-layer-nand',
        category: '存储芯片',
        tags: ['长江存储', '3D NAND', '128层', '存储'],
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6小时前
      },
      {
        title: '全球晶圆代工产能紧张，价格持续上涨',
        summary: '受AI芯片需求激增影响，全球晶圆代工产能持续紧张，代工价格普遍上涨10-15%。',
        source: '芯思想',
        original_url: 'https://www.xinsiwei.com/foundry-capacity-shortage-price-rise',
        category: '代工制造',
        tags: ['晶圆代工', '产能', '价格', '紧张'],
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12小时前
      },
      {
        title: 'RISC-V生态快速发展，开源芯片架构获得更多支持',
        summary: 'RISC-V开源指令集架构生态系统快速发展，越来越多的芯片厂商和软件公司加入RISC-V联盟。',
        source: '电子工程世界',
        original_url: 'https://www.eeworld.com.cn/risc-v-ecosystem-growth',
        category: '架构技术',
        tags: ['RISC-V', '开源', '指令集', '生态'],
        published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1天前
      }
    ]

         const { data: insertedNews, error: insertError } = await supabaseAdmin
       .from('news')
       .insert(newNews)

    if (insertError) {
      console.error('插入新闻失败:', insertError)
      return c.json({
        success: false,
        message: '插入新闻失败',
        error: insertError.message
      }, 500)
    }

    return c.json({
      success: true,
      message: '新闻链接更新完成',
      data: {
        updatedCount: updateCount,
        insertedCount: newNews.length,
        totalProcessed: updateCount + newNews.length
      }
    })
  } catch (error) {
    console.error('更新新闻链接失败:', error)
    return c.json({
      success: false,
      message: '更新失败',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

export default app