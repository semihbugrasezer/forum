'use client';

import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern ile tek bir Supabase istemcisi oluşturuyoruz
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

export const createBrowserSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  
  return supabaseInstance;
};

// Doğrudan kullanım için Supabase istemcisi
export const supabase = createBrowserSupabaseClient(); 