'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/lib/supabase/database.types';
import { cache } from 'react';

// Tiered caching TTLs for different data types
const CACHE_TTL = {
  static: 24 * 60 * 60 * 1000,      // 24 hours for static/reference data
  public: 60 * 60 * 1000,           // 1 hour for public content
  personalized: 5 * 60 * 1000,      // 5 minutes for personalized content
  dynamic: 1 * 60 * 1000,           // 1 minute for very dynamic content
};

// Enhanced memory cache with size limits
class LRUCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (most recently used position)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item.data;
  }
  
  set(key: string, data: T, ttl: number) {
    // Evict if we're at capacity
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry (first item in map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  clear(pattern?: RegExp) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Clear entries matching pattern
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create specialized caches for different data types
const queryCache = {
  reference: new LRUCache<any>(500),    // Smaller cache for rarely changing data
  content: new LRUCache<any>(5000),     // Larger cache for main content
  user: new LRUCache<any>(10000),       // User-specific cache entries
};

// Automatically clean expired cache entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    Object.values(queryCache).forEach(cache => cache.cleanup());
  }, 60000); // Clean every minute
}

/**
 * Creates a Supabase client for server components with optimized settings for high traffic
 */
export const createClient = cache(async () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  // High performance client configuration
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
      global: {
        // Custom fetch implementation with connection reuse
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            keepalive: true,
            headers: {
              ...options?.headers,
              'Connection': 'keep-alive',
            },
          });
        },
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

// Helper for cached database operations with tiered caching
export async function cachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  options: {
    cacheType: 'reference' | 'content' | 'user',
    ttl?: number,
    userId?: string
  }
): Promise<T> {
  const { cacheType, ttl = CACHE_TTL.public, userId } = options;
  
  // For user-specific data, include user ID in cache key
  const finalCacheKey = userId ? `${userId}:${cacheKey}` : cacheKey;
  
  // Check cache
  const cachedResult = queryCache[cacheType].get(finalCacheKey);
  if (cachedResult !== null) {
    return cachedResult;
  }
  
  // Execute the query
  const result = await queryFn();
  
  // Cache the result
  queryCache[cacheType].set(finalCacheKey, result, ttl);
  
  return result;
}

// Invalidate cache entries that match a pattern
export async function invalidateCache(pattern: RegExp, cacheType?: 'reference' | 'content' | 'user') {
  if (cacheType) {
    queryCache[cacheType].clear(pattern);
  } else {
    // Clear from all caches if type not specified
    Object.values(queryCache).forEach(cache => cache.clear(pattern));
  }
  
  // Return a resolved promise to satisfy the async requirement
  return Promise.resolve();
}

// Database operations with optimized caching for read operations
export async function getTopics(page = 1, limit = 10, categoryId?: string) {
  try {
    const supabase = await createClient();
    const start = (page - 1) * limit;
    
    // For high traffic, limit the fields returned
    const cacheKey = `topics_p${page}_l${limit}${categoryId ? `_c${categoryId}` : ''}`;
    
    return cachedQuery(cacheKey, async () => {
      // Start with a base query builder
      let query = supabase
        .from('topics')
        .select(`
          id, 
          title, 
          slug,
          created_at,
          updated_at,
          view_count,
          reply_count,
          is_pinned,
          author: profiles (
            id,
            full_name
          ),
          category: categories (
            id,
            name
          ),
          _count
        `, { count: 'exact' })
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });
      
      // Apply category filter if provided
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      // Apply pagination with range
      const { data, error, count } = await query.range(start, start + limit - 1);

      if (error) {
        console.error('Error fetching topics:', error);
        return { data: [], count: 0 };
      }

      return { data: data || [], count: count || 0 };
    }, {
      cacheType: 'content',
      ttl: CACHE_TTL.dynamic, // Quick refresh for topic listings
    });
  } catch (error) {
    console.error('Error in getTopics:', error);
    return { data: [], count: 0 };
  }
}

// Get a specific topic by ID with optimized fields
export async function getTopic(id: string) {
  try {
    const supabase = await createClient();
    
    return cachedQuery(`topic_${id}`, async () => {
      const { data, error } = await supabase
        .from('topics')
        .select(`
          *,
          author: profiles (
            id,
            email,
            full_name,
            avatar_url
          ),
          category: categories (
            id,
            name,
            slug
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error fetching topic by ID:', error);
        return null;
      }

      return data;
    }, {
      cacheType: 'content',
      ttl: CACHE_TTL.public,
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
      // Using proper caching for performance and reduced database load
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }
      
      // Transform data to match expected format for the UI
      return (data || []).map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        topic_id: comment.topic_id,
        author: comment.profiles ? {
          id: comment.profiles.id,
          full_name: comment.profiles.name || 'Anonymous',
          avatar_url: comment.profiles.avatar_url
        } : {
          id: comment.user_id || '',
          full_name: comment.author_name || 'Anonymous',
          avatar_url: null
        },
        is_solution: comment.is_solution || false
      }));
    }, {
      cacheType: 'content',
      ttl: 60 * 1000 // Cache for 1 minute
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