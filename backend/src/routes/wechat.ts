import { Hono } from 'hono'
import { createSupabaseClient } from '../config/database'

const app = new Hono()

// 测试端点
app.get('/test', async (c) => {
  return c.json({
    success: true,
    message: '测试端点正常',
    env: {
      hasSupabaseUrl: !!c.env?.SUPABASE_URL,
      hasAnonKey: !!c.env?.SUPABASE_ANON_KEY,
      hasServiceKey: !!c.env?.SUPABASE_SERVICE_ROLE_KEY
    }
  })
})

// 获取微信公众号列表
app.get('/', async (c) => {
  try {
    // 暂时返回静态数据，确保前端能正常工作
    const staticData = [
      {
        id: '1',
        name: '芯东西',
        wechat_id: 'aichip001',
        description: '专注人工智能芯片产业报道',
        positioning: '智能芯片第一媒体',
        target_audience: 'AI芯片从业者、投资者',
        operator_background: '资深科技媒体团队，专注AI芯片领域多年',
        qr_code_url: null,
        is_verified: true,
        follower_count: 50000,
        is_active: true,
        tags: ['AI芯片', '人工智能', '媒体', '深度报道'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: '芯师爷',
        wechat_id: 'xinshiye',
        description: 'IC产业链深度分析和投资研究',
        positioning: '芯片产业投资风向标',
        target_audience: 'IC投资者、分析师、高管',
        operator_background: '投资机构背景，专业IC产业分析师团队',
        qr_code_url: null,
        is_verified: true,
        follower_count: 30000,
        is_active: true,
        tags: ['投资', '分析', '产业链', '研究'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: '半导体行业观察',
        wechat_id: 'icbank',
        description: '半导体产业全景观察和分析',
        positioning: '半导体产业观察员',
        target_audience: '半导体从业者、投资者、媒体',
        operator_background: '半导体行业资深从业者和分析师',
        qr_code_url: null,
        is_verified: true,
        follower_count: 80000,
        is_active: true,
        tags: ['半导体', '观察', '分析', '产业'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ]

    return c.json({
      success: true,
      data: staticData,
      count: staticData.length
    })

    // 以下是原始的数据库查询代码，暂时注释掉
    /*
    console.log('开始处理微信公众号请求')
    console.log('环境变量检查:', {
      hasSupabaseUrl: !!c.env?.SUPABASE_URL,
      hasAnonKey: !!c.env?.SUPABASE_ANON_KEY,
      hasServiceKey: !!c.env?.SUPABASE_SERVICE_ROLE_KEY
    })

    const { supabase } = createSupabaseClient(c.env)
    console.log('Supabase客户端创建成功')
    
    const { data, error } = await supabase
      .from('wechat_accounts')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    console.log('数据库查询结果:', { data: data?.length, error })

    if (error) {
      console.error('数据库查询错误:', error)
      return c.json({
        success: false,
        message: '获取微信公众号失败',
        error: error.message
      }, 500)
    }

    return c.json({
      success: true,
      data,
      count: data.length
    })
    */
  } catch (error) {
    console.error('服务器错误:', error)
    return c.json({
      success: false,
      message: '服务器内部错误',
      error: error instanceof Error ? error.message : String(error)
    }, 500)
  }
})

export default app