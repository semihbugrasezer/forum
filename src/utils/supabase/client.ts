"use client";

import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(`
    Supabase environment variables missing!
    Please check your .env.local file
  `);
}

export const createBrowserClient = () => 
  createBrowserSupabaseClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });

export { createClient };
