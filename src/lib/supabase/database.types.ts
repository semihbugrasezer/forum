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
      profiles: {
        Row: {
          id: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          avatar_url?: string | null
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
          user_id: string
          category: string
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
          views: number
          is_pinned: boolean
          is_locked: boolean
          last_activity_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          category: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          last_activity_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          category?: string
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views?: number
          is_pinned?: boolean
          is_locked?: boolean
          last_activity_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          content: string
          user_id: string
          topic_id: string
          parent_id: string | null
          created_at: string
          updated_at: string
          is_solution: boolean
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          topic_id: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_solution?: boolean
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          topic_id?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
          is_solution?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
          }
        ]
      }
      likes: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "topics"
            referencedColumns: ["id"]
          }
        ]
      }
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
  auth: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
      }
    }
  }
}
