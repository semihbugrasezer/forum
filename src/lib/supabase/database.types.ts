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
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          topics_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          topics_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          topics_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          content: string
          user_id: string | null
          author_name: string | null
          topic_id: string
          parent_id: string | null
          created_at: string
          updated_at: string | null
          is_solution: boolean
        }
        Insert: {
          id?: string
          content: string
          user_id?: string | null
          author_name?: string | null
          topic_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string | null
          is_solution?: boolean
        }
        Update: {
          id?: string
          content?: string
          user_id?: string | null
          author_name?: string | null
          topic_id?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string | null
          is_solution?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          user_id: string | null
          topic_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          topic_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          topic_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      topics: {
        Row: {
          id: string
          title: string
          content: string
          slug: string | null
          user_id: string | null
          category: string | null
          tags: string[] | null
          likes_count: number
          comments_count: number
          views: number
          is_pinned: boolean
          is_locked: boolean
          created_at: string
          updated_at: string | null
          last_activity_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          slug?: string | null
          user_id?: string | null
          category?: string | null
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string | null
          last_activity_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          slug?: string | null
          user_id?: string | null
          category?: string | null
          tags?: string[] | null
          likes_count?: number
          comments_count?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string | null
          last_activity_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_category_fkey"
            columns: ["category"]
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "topics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_comment_count: {
        Args: {
          topic_id: string
        }
        Returns: undefined
      }
      increment_view_count: {
        Args: {
          topic_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          raw_user_meta_data: Json
          aud: string
          role: string
          updated_at: string | null
          last_sign_in_at: string | null
          app_metadata: Json
          user_metadata: Json
          is_super_admin: boolean | null
          banned_until: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          recovery_token: string | null
          email_change_token_new: string | null
          email_change: string | null
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          raw_user_meta_data?: Json
          aud?: string
          role?: string
          updated_at?: string | null
          last_sign_in_at?: string | null
          app_metadata?: Json
          user_metadata?: Json
          is_super_admin?: boolean | null
          banned_until?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          recovery_token?: string | null
          email_change_token_new?: string | null
          email_change?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          raw_user_meta_data?: Json
          aud?: string
          role?: string
          updated_at?: string | null
          last_sign_in_at?: string | null
          app_metadata?: Json
          user_metadata?: Json
          is_super_admin?: boolean | null
          banned_until?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          recovery_token?: string | null
          email_change_token_new?: string | null
          email_change?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string | null
          factor_id: string | null
          aal: string | null
          not_after: string | null
        }
        Insert: {
          id: string
          user_id: string
          created_at?: string
          updated_at?: string | null
          factor_id?: string | null
          aal?: string | null
          not_after?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string | null
          factor_id?: string | null
          aal?: string | null
          not_after?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
