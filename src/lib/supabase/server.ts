'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Sunucu tarafı Supabase istemcisi
export async function createServerSupabaseClient() {
  try {
    const cookiesInstance = cookies();
    if (!cookiesInstance) {
      console.error('Cookies instance could not be created');
      throw new Error('Cookies instance could not be created');
    }
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase environment variables are missing', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey 
      });
      throw new Error('Supabase environment variables are missing');
    }
    
    const client = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get: async (name) => {
            const cookie = (await cookiesInstance).get(name);
            return cookie?.value;
          },
          set: async (name, value, options) => {
            try {
              // Ensure we're not setting an empty cookie value
              if (value === '') {
                (await cookiesInstance).delete(name);
              } else {
                (await cookiesInstance).set({
                  name,
                  value,
                  ...options,
                  // Ensure secure cookies in production
                  secure: process.env.NODE_ENV === 'production',
                  // Use SameSite=Lax for better security while allowing OAuth redirects
                  sameSite: 'lax',
                  // Set path to root to ensure cookies are available across the site
                  path: '/',
                });
              }
            } catch (error) {
              console.error(`Error setting cookie ${name}:`, error);
            }
          },
          remove: async (name, options) => {
            try {
              (await cookiesInstance).delete(name);
            } catch (error) {
              console.error(`Error removing cookie ${name}:`, error);
            }
          },
        },
      }
    );
    
    if (!client || !client.auth) {
      console.error('Supabase client could not be created properly');
      throw new Error('Supabase client could not be created properly');
    }
    
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw error;
  }
} 