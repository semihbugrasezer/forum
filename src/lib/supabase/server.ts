'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// Environment validation'ı tek seferlik yapalım
let envChecked = false;

async function checkEnvironmentVariables() {
  if (!envChecked) {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
    }
    envChecked = true;
  }
}

// Cookie options for better security
const getCookieOptions = () => ({
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60, // 7 days
});

// Error handling wrapper
async function withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error('Supabase operation error:', error);
    throw new Error('An error occurred while performing the operation');
  }
}

// Singleton client instance with proper async handling
let supabaseClient: ReturnType<typeof createServerClient<Database>> | null = null;
let clientPromise: Promise<ReturnType<typeof createServerClient<Database>>> | null = null;

// Create a Supabase client for server components
export async function createClient() {
  await checkEnvironmentVariables();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookie setting error
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal error
          }
        },
      },
    }
  );
}

// Database operations
export async function getTopics(page = 1, limit = 10) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('topics')
    .select(`
      *,
      author: profiles (
        id,
        email,
        full_name
      ),
      category: categories (
        id,
        name
      ),
      _count
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, start + limit - 1);

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  return {
    topics: data,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}

export async function getTopic(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      author: profiles (
        id,
        email,
        full_name
      ),
      category: categories (
        id,
        name
      ),
      comments (
        id,
        content,
        created_at,
        author: profiles (
          id,
          email,
          full_name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  return data;
}

export async function createTopic(data: any) {
  const supabase = await createClient();
  
  const { data: topic, error } = await supabase
    .from('topics')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  return topic;
}