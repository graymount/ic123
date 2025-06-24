export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      websites: {
        Row: {
          id: string
          name: string
          url: string
          description: string
          category_id: string | null
          target_audience: string | null
          use_case: string | null
          is_active: boolean
          visit_count: number
          rating: number
          tags: string[] | null
          screenshot_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          description: string
          category_id?: string | null
          target_audience?: string | null
          use_case?: string | null
          is_active?: boolean
          visit_count?: number
          rating?: number
          tags?: string[] | null
          screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          description?: string
          category_id?: string | null
          target_audience?: string | null
          use_case?: string | null
          is_active?: boolean
          visit_count?: number
          rating?: number
          tags?: string[] | null
          screenshot_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wechat_accounts: {
        Row: {
          id: string
          name: string
          wechat_id: string | null
          description: string
          positioning: string | null
          target_audience: string | null
          operator_background: string | null
          qr_code_url: string | null
          is_verified: boolean
          follower_count: number | null
          is_active: boolean
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          wechat_id?: string | null
          description: string
          positioning?: string | null
          target_audience?: string | null
          operator_background?: string | null
          qr_code_url?: string | null
          is_verified?: boolean
          follower_count?: number | null
          is_active?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          wechat_id?: string | null
          description?: string
          positioning?: string | null
          target_audience?: string | null
          operator_background?: string | null
          qr_code_url?: string | null
          is_verified?: boolean
          follower_count?: number | null
          is_active?: boolean
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          summary: string | null
          content: string | null
          source: string
          author: string | null
          original_url: string
          image_url: string | null
          category: string | null
          tags: string[] | null
          view_count: number
          is_featured: boolean
          published_at: string
          crawled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          summary?: string | null
          content?: string | null
          source: string
          author?: string | null
          original_url: string
          image_url?: string | null
          category?: string | null
          tags?: string[] | null
          view_count?: number
          is_featured?: boolean
          published_at: string
          crawled_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          summary?: string | null
          content?: string | null
          source?: string
          author?: string | null
          original_url?: string
          image_url?: string | null
          category?: string | null
          tags?: string[] | null
          view_count?: number
          is_featured?: boolean
          published_at?: string
          crawled_at?: string
          created_at?: string
        }
      }
      user_feedback: {
        Row: {
          id: string
          type: 'website' | 'wechat' | 'bug' | 'suggestion'
          title: string
          content: string
          contact_info: string | null
          status: 'pending' | 'reviewed' | 'approved' | 'rejected'
          admin_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'website' | 'wechat' | 'bug' | 'suggestion'
          title: string
          content: string
          contact_info?: string | null
          status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'website' | 'wechat' | 'bug' | 'suggestion'
          title?: string
          content?: string
          contact_info?: string | null
          status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      visit_stats: {
        Row: {
          id: string
          resource_type: 'website' | 'news' | 'wechat'
          resource_id: string
          visitor_ip: string | null
          user_agent: string | null
          referer: string | null
          visited_at: string
        }
        Insert: {
          id?: string
          resource_type: 'website' | 'news' | 'wechat'
          resource_id: string
          visitor_ip?: string | null
          user_agent?: string | null
          referer?: string | null
          visited_at?: string
        }
        Update: {
          id?: string
          resource_type?: 'website' | 'news' | 'wechat'
          resource_id?: string
          visitor_ip?: string | null
          user_agent?: string | null
          referer?: string | null
          visited_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          username: string
          display_name: string | null
          avatar_url: string | null
          is_verified: boolean
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          is_verified?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      email_verifications: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          verified_at?: string | null
          created_at?: string
        }
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          token_hash: string
          expires_at: string
          user_agent: string | null
          ip_address: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          token_hash: string
          expires_at: string
          user_agent?: string | null
          ip_address?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          token_hash?: string
          expires_at?: string
          user_agent?: string | null
          ip_address?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          resource_type: 'news'
          resource_id: string
          content: string
          parent_id: string | null
          is_deleted: boolean
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: 'news'
          resource_id: string
          content: string
          parent_id?: string | null
          is_deleted?: boolean
          like_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: 'news'
          resource_id?: string
          content?: string
          parent_id?: string | null
          is_deleted?: boolean
          like_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          resource_type: 'news' | 'comment'
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_type: 'news' | 'comment'
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_type?: 'news' | 'comment'
          resource_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      active_websites_with_category: {
        Row: {
          id: string
          name: string
          url: string
          description: string
          target_audience: string | null
          use_case: string | null
          visit_count: number
          rating: number
          tags: string[] | null
          created_at: string
          category_name: string | null
          category_icon: string | null
        }
      }
      latest_news: {
        Row: {
          id: string
          title: string
          summary: string | null
          source: string
          original_url: string
          image_url: string | null
          category: string | null
          tags: string[] | null
          view_count: number
          is_featured: boolean
          published_at: string
          created_at: string
        }
      }
      featured_content: {
        Row: {
          content_type: string
          id: string
          name: string
          description: string | null
          url: string
          tags: string[] | null
          date: string
        }
      }
    }
  }
}