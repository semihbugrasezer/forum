export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          display_name: string
          email: string
          role: string
          created_at: string
          last_login: string | null
        }
        Insert: {
          id: string
          display_name: string
          email: string
          role?: string
          created_at?: string
          last_login?: string | null
        }
        Update: {
          id?: string
          display_name?: string
          email?: string
          role?: string
          created_at?: string
          last_login?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: string
          status: string
          views: number
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category_id: string
          status?: string
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category_id?: string
          status?: string
          views?: number
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          author_id: string
          post_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          author_id: string
          post_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          author_id?: string
          post_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          site_name: string
          site_description: string | null
          allow_registration: boolean
          require_email_verification: boolean
          allow_guest_posts: boolean
          max_posts_per_user: number
          max_comments_per_post: number
          maintenance_mode: boolean
          default_user_role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name: string
          site_description?: string | null
          allow_registration?: boolean
          require_email_verification?: boolean
          allow_guest_posts?: boolean
          max_posts_per_user?: number
          max_comments_per_post?: number
          maintenance_mode?: boolean
          default_user_role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string | null
          allow_registration?: boolean
          require_email_verification?: boolean
          allow_guest_posts?: boolean
          max_posts_per_user?: number
          max_comments_per_post?: number
          maintenance_mode?: boolean
          default_user_role?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 