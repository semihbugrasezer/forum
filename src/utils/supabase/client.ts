"use client";

import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(`
    Supabase environment variables missing!
    Please check your .env.local file
  `);
}

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserSupabaseClient<Database>> | null = null;

export const createBrowserClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createBrowserSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return supabaseInstance;
};

export function createClient() {
  return createBrowserClient();
}

// Drop-in replacement for the deprecated createClientComponentClient
export function createClientComponentClient() {
  return createBrowserClient();
}
