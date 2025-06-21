import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import dotenv from 'dotenv'

// 确保环境变量被加载
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Environment variables status:')
  console.error('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'MISSING')
  throw new Error('Missing required Supabase environment variables')
}

// 公开客户端（用于读取操作）
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 服务端客户端（用于管理操作）
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})