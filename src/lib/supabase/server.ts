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

// Connection pool settings
const DB_POOL_SIZE = parseInt(process.env.DB_POOL_SIZE || '10', 10);
const DB_CONNECTION_TIMEOUT = parseInt(process.env.DB_CONNECTION_TIMEOUT || '30', 10);

// Simple in-memory cache for query results
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '3600', 10) * 1000; // Convert to ms

// Create a Supabase client for server components with optimized connection handling
export async function createClient() {
  await checkEnvironmentVariables();
  
  // Use cookie store
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
            console.warn('Failed to set cookie:', error);
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie removal error
            console.warn('Failed to remove cookie:', error);
          }
        },
      },
      // Global error handler for better debugging
      global: {
        fetch: async (url, options) => {
          const start = Date.now();
          try {
            return await fetch(url, options);
          } catch (error) {
            console.error(`Supabase fetch error: ${url}`, error);
            throw error;
          } finally {
            const duration = Date.now() - start;
            if (duration > 1000) { // Log slow queries (>1s)
              console.warn(`Slow Supabase query: ${duration}ms - ${url}`);
            }
          }
        }
      }
    }
  );
}

// Helper for cached database operations
async function cachedQuery<T>(
  cacheKey: string, 
  queryFn: () => Promise<T>, 
  ttl: number = CACHE_DURATION
): Promise<T> {
  const cached = queryCache.get(cacheKey);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp < ttl)) {
    return cached.data as T;
  }
  
  // Clear expired entries periodically
  if (now % 60000 < 1000) { // Approximately once a minute
    for (const [key, value] of queryCache.entries()) {
      if (now - value.timestamp > ttl) {
        queryCache.delete(key);
      }
    }
  }
  
  // Execute the query
  const result = await queryFn();
  
  // Cache the result
  queryCache.set(cacheKey, { data: result, timestamp: now });
  
  return result;
}

// Database operations with caching for read operations
export async function getTopics(page = 1, limit = 10) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  
  // Use caching for public data
  return cachedQuery(`topics_p${page}_l${limit}`, async () => {
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
  }, 60000); // 1 minute cache for topics list, refreshed more frequently
}

export async function getTopic(id: string) {
  const supabase = await createClient();
  
  // Individual topics can be cached longer
  return cachedQuery(`topic_${id}`, async () => {
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
  });
}

// Write operations bypass cache
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
  
  // Invalidate topics list cache
  const keysToInvalidate = Array.from(queryCache.keys())
    .filter(key => key.startsWith('topics_p'));
  
  keysToInvalidate.forEach(key => queryCache.delete(key));

  return topic;
}