import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

// 创建Supabase客户端的函数
export function createSupabaseClient(env: any) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseAnonKey = env.SUPABASE_ANON_KEY
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    throw new Error('Missing required Supabase environment variables')
  }

  // 公开客户端（用于读取操作）
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  // 服务端客户端（用于管理操作）
  const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return { supabase, supabaseAdmin }
}

// 默认导出（用于开发环境，实际值需要通过secrets设置）
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseAnonKey = 'your-anon-key'
const supabaseServiceKey = 'your-service-role-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)