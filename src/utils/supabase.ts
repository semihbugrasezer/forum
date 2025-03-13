'use client';

import { supabase as supabaseClient } from '@/lib/supabase/client';
import type { Database as ImportedDatabase } from './database.types';

// Re-export the singleton Supabase client
export const supabase = supabaseClient;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          role: 'admin' | 'user' | 'moderator';
          created_at: string;
          last_login: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email: string;
          role?: 'admin' | 'user' | 'moderator';
          created_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string;
          role?: 'admin' | 'user' | 'moderator';
          created_at?: string;
          last_login?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          author_name: string;
          category_id: string;
          category_name: string;
          created_at: string;
          updated_at: string;
          status: 'active' | 'archived' | 'deleted';
          views: number;
          likes: number;
          comments: number;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          author_name: string;
          category_id: string;
          category_name: string;
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'archived' | 'deleted';
          views?: number;
          likes?: number;
          comments?: number;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          author_name?: string;
          category_id?: string;
          category_name?: string;
          created_at?: string;
          updated_at?: string;
          status?: 'active' | 'archived' | 'deleted';
          views?: number;
          likes?: number;
          comments?: number;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          post_id: string;
          author_id: string;
          author_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          post_id: string;
          author_id: string;
          author_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          post_id?: string;
          author_id?: string;
          author_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      settings: {
        Row: {
          id: string;
          site_name: string;
          site_description: string;
          allow_registration: boolean;
          require_email_verification: boolean;
          allow_guest_posts: boolean;
          max_posts_per_user: number;
          max_comments_per_post: number;
          maintenance_mode: boolean;
          default_user_role: 'user' | 'moderator' | 'admin';
        };
        Insert: {
          id: string;
          site_name: string;
          site_description: string;
          allow_registration: boolean;
          require_email_verification: boolean;
          allow_guest_posts: boolean;
          max_posts_per_user: number;
          max_comments_per_post: number;
          maintenance_mode: boolean;
          default_user_role: 'user' | 'moderator' | 'admin';
        };
        Update: {
          id?: string;
          site_name?: string;
          site_description?: string;
          allow_registration?: boolean;
          require_email_verification?: boolean;
          allow_guest_posts?: boolean;
          max_posts_per_user?: number;
          max_comments_per_post?: number;
          maintenance_mode?: boolean;
          default_user_role?: 'user' | 'moderator' | 'admin';
        };
      };
    };
  };
}; 