export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string | null
          username: string | null
          bio: string | null
          location: string | null
          website: string | null
          miles_points: number | null
          status: string | null
          last_seen: string | null
          email: string | null
          is_active: boolean
          is_verified: boolean
          is_admin: boolean
          is_moderator: boolean
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          username?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          miles_points?: number | null
          status?: string | null
          last_seen?: string | null
          email?: string | null
          is_active?: boolean
          is_verified?: boolean
          is_admin?: boolean
          is_moderator?: boolean
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string | null
          username?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          miles_points?: number | null
          status?: string | null
          last_seen?: string | null
          email?: string | null
          is_active?: boolean
          is_verified?: boolean
          is_admin?: boolean
          is_moderator?: boolean
        }
      }
      topics: {
        Row: {
          id: string
          title: string
          content: string
          created_at: string
          updated_at: string | null
          author_id: string
          category_id: string
          is_pinned: boolean
          is_locked: boolean
          type: string | null
          view_count: number
          vote_count: number
          comment_count: number
          slug: string
          status: string
          tags: string[] | null
          image_urls: string[] | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_at?: string
          updated_at?: string | null
          author_id: string
          category_id: string
          is_pinned?: boolean
          is_locked?: boolean
          type?: string | null
          view_count?: number
          vote_count?: number
          comment_count?: number
          slug: string
          status?: string
          tags?: string[] | null
          image_urls?: string[] | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string | null
          author_id?: string
          category_id?: string
          is_pinned?: boolean
          is_locked?: boolean
          type?: string | null
          view_count?: number
          vote_count?: number
          comment_count?: number
          slug?: string
          status?: string
          tags?: string[] | null
          image_urls?: string[] | null
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          created_at: string
          updated_at: string | null
          author_id: string
          topic_id: string
          is_edited: boolean
          vote_count: number
          parent_id: string | null
        }
        Insert: {
          id?: string
          content: string
          created_at?: string
          updated_at?: string | null
          author_id: string
          topic_id: string
          is_edited?: boolean
          vote_count?: number
          parent_id?: string | null
        }
        Update: {
          id?: string
          content?: string
          created_at?: string
          updated_at?: string | null
          author_id?: string
          topic_id?: string
          is_edited?: boolean
          vote_count?: number
          parent_id?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string | null
          color: string | null
          icon: string | null
          topic_count: number
          parent_id: string | null
          slug: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
          color?: string | null
          icon?: string | null
          topic_count?: number
          parent_id?: string | null
          slug: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
          color?: string | null
          icon?: string | null
          topic_count?: number
          parent_id?: string | null
          slug?: string
        }
      }
      votes: {
        Row: {
          id: string
          created_at: string
          user_id: string
          topic_id: string | null
          comment_id: string | null
          value: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          topic_id?: string | null
          comment_id?: string | null
          value: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          topic_id?: string | null
          comment_id?: string | null
          value?: number
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          link: string | null
          sender_id: string | null
          topic_id: string | null
          comment_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          link?: string | null
          sender_id?: string | null
          topic_id?: string | null
          comment_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          link?: string | null
          sender_id?: string | null
          topic_id?: string | null
          comment_id?: string | null
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