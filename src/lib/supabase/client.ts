'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

/**
 * Creates a Supabase browser client for client components
 * This client must only be used in client components 
 * (those with 'use client' directive)
 */
export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// This is a convenience export
export const supabase = createClient(); 