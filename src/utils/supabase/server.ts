import { createServerClient as createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export const createServerClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createClient<Database>({
    cookies: {
      async get(name: string) {
        try {
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error(`Error getting cookie ${name}:`, error);
          return undefined;
        }
      },
      async set(name: string, value: string, options: any) {
        try {
          cookieStore.set({
            name,
            value,
            ...options,
            // Ensure secure cookies in production
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      async remove(name: string, options: any) {
        try {
          cookieStore.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
            // Ensure secure cookies in production
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      },
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: true,
    },
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
};
