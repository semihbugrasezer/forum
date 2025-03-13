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
      posts: {
        Row: {
          id: string
          created_at: string
          title: string
          content: string
          author_id: string
          category_id: string
          updated_at: string | null
          views: number
          likes: number
          is_pinned: boolean
          is_locked: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          content: string
          author_id: string
          category_id: string
          updated_at?: string | null
          views?: number
          likes?: number
          is_pinned?: boolean
          is_locked?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          content?: string
          author_id?: string
          category_id?: string
          updated_at?: string | null
          views?: number
          likes?: number
          is_pinned?: boolean
          is_locked?: boolean
        }
      }
      comments: {
        Row: {
          id: string
          created_at: string
          content: string
          author_id: string
          post_id: string
          parent_id: string | null
          updated_at: string | null
          likes: number
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          author_id: string
          post_id: string
          parent_id?: string | null
          updated_at?: string | null
          likes?: number
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          author_id?: string
          post_id?: string
          parent_id?: string | null
          updated_at?: string | null
          likes?: number
        }
      }
      categories: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          parent_id: string | null
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          parent_id?: string | null
          order?: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          order?: number
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          display_name: string | null
          avatar_url: string | null
          role: string
          last_login: string | null
          is_premium: boolean
          premium_until: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          last_login?: string | null
          is_premium?: boolean
          premium_until?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          role?: string
          last_login?: string | null
          is_premium?: boolean
          premium_until?: string | null
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
};

// Define the types that are imported in various files

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  views: number;
  likes: number;
  comments: number;
  tags?: string[];
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  likes: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  parentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  topicCount?: number;
  icon?: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  photoURL?: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  createdAt: string | Date;
}