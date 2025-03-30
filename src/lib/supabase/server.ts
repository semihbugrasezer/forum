'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { cache } from 'react';

/**
 * Creates a Supabase client for server components with proper cookie handling
 * Compatible with Next.js 15
 */
export const createClient = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        flowType: 'pkce',
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true,
      },
      cookies: {
        async get(name) {
          try {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.error(`Error getting cookie ${name}:`, error);
            return null;
          }
        },
        async set(name, value, options) {
          try {
            const cookieStore = await cookies();
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
            console.error(`Error setting cookie ${name}:`, error);
          }
        },
        async remove(name, options) {
          try {
            const cookieStore = await cookies();
            cookieStore.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
              // Ensure secure cookies in production
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          } catch (error) {
            console.error(`Error removing cookie ${name}:`, error);
          }
        },
      },
    }
  );
});

// Simple in-memory cache for query results
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION || '3600', 10) * 1000; // Convert to ms

// Helper for cached database operations
export async function cachedQuery<T>(
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
    for (const [key, value] of Array.from(queryCache.entries())) {
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
  try {
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
        console.error('Error fetching topics:', error);
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count || 0 };
    });
  } catch (error) {
    console.error('Error in getTopics:', error);
    return { data: [], count: 0 };
  }
}

// Get a specific topic by ID
export async function getTopic(id: string) {
  try {
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
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error fetching topic by ID:', error);
        return null;
      }

      return data;
    });
  } catch (error) {
    console.error('Error in getTopic:', error);
    return null;
  }
}

// Get a topic by slug first, then try by ID if that fails
export async function getTopicBySlug(slug: string) {
  if (!slug) {
    console.error("getTopicBySlug: No slug provided");
    return null;
  }

  try {
    const supabase = await createClient();
    
    // Use caching for public data
    return cachedQuery(`topic_slug_${slug}`, async () => {
      // Try to get topic by slug first
      const { data, error } = await supabase
        .from("topics")
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
          )
        `)
        .eq("slug", slug)
        .single();
      
      if (data) {
        return data;
      }
      
      console.log(`getTopicBySlug: No topic found with slug "${slug}", trying as ID`);
      
      // If slug looks like a UUID or number, try as ID
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug) || 
        /^\d+$/.test(slug)
      ) {
        const { data: dataById, error: errorById } = await supabase
          .from("topics")
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
            )
          `)
          .eq("id", slug)
          .single();
        
        if (dataById) {
          return dataById;
        }
        
        if (errorById) {
          console.error('Error fetching topic by ID:', errorById);
        }
      }
      
      console.error(`getTopicBySlug: Topic not found for "${slug}"`);
      return null;
    });
  } catch (error) {
    console.error('Error fetching topic by slug:', error);
    return null;
  }
}

// Get comments for a specific topic
export async function getComments(topicId: string) {
  try {
    const supabase = await createClient();
    
    return cachedQuery(`comments_${topicId}`, async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author: profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      return data || [];
    });
  } catch (error) {
    console.error('Error in getComments:', error);
    return [];
  }
}

// Create a mock Supabase client for development
function createMockClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, { ascending }: { ascending: boolean }) => ({
            range: (start: number, end: number) => ({
              data: [],
              error: null,
              count: 0
            }),
            data: [],
            error: null,
          }),
          single: () => ({
            data: null,
            error: null
          }),
          data: [],
          error: null,
        }),
        match: (criteria: any) => ({
          single: () => ({
            data: null,
            error: null
          }),
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          range: (start: number, end: number) => ({
            data: [],
            error: null,
            count: 0
          }),
          data: [],
          error: null,
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            data: { id: 'mock-id', ...data },
            error: null
          }),
        }),
      }),
    }),
    rpc: (procedure: string, params: any) => ({
      data: null,
      error: null
    }),
    auth: {
      getUser: async () => ({
        data: { user: null },
        error: null
      }),
      signOut: async () => ({
        error: null
      })
    },
    storage: {
      from: (bucket: string) => ({
        download: async (path: string) => ({
          data: new Blob(),
          error: null
        }),
        upload: async (path: string, file: any) => ({
          data: { path },
          error: null
        })
      })
    }
  } as any;
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