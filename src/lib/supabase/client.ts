'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Creates a Supabase browser client for client components
 * This client must only be used in client components 
 * (those with 'use client' directive)
 * Uses singleton pattern to prevent multiple instances
 */
export const createClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  return supabaseInstance;
};

// This is a convenience export - still using singleton pattern
export const supabase = createClient(); 