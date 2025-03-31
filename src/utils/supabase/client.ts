"use client";

import { createBrowserClient as createBrowserSupabaseClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(`
    Supabase environment variables missing!
    Please check your .env.local file
  `);
}

// Caching configurations for different query types
const cacheTTL = {
  reference: 1000 * 60 * 10, // 10 minutes for reference data (categories, settings)
  listing: 1000 * 60 * 2,    // 2 minutes for listing data (topic lists)
  profile: 1000 * 60 * 5,    // 5 minutes for user profiles
};

// In-memory query cache for client-side
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Singleton instance
let supabaseInstance: ReturnType<typeof createBrowserSupabaseClient<Database>> | null = null;

export const createBrowserClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  // Create client with optimized configuration for high traffic
  supabaseInstance = createBrowserSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (url, options) => {
          // Implement custom fetch with advanced caching logic 
          // Only GET requests should be cached
          if (options?.method && options.method !== 'GET') {
            // For non-GET requests, invalidate potentially affected caches
            const urlObj = new URL(url.toString());
            const path = urlObj.pathname;
            
            // Clear related cache entries when data is modified
            Array.from(queryCache.keys()).forEach(key => {
              if (key.includes(path)) {
                queryCache.delete(key);
              }
            });
            
            return fetch(url, options);
          }
          
          return fetch(url, {
            ...options,
            // Enable HTTP keep-alive for connection reuse
            keepalive: true,
            // Add proper cache control headers
            headers: {
              ...options?.headers,
              'Connection': 'keep-alive',
            },
          });
        },
      },
      realtime: {
        // Optimize websocket connections for high traffic
        params: {
          eventsPerSecond: 10,
        },
      },
    }
  );
  
  return supabaseInstance;
};

// Client-side query caching utility
export async function cachedQuery<T>(
  key: string, 
  queryFn: () => Promise<T>, 
  ttl: number
): Promise<T> {
  // Clean expired items periodically
  const now = Date.now();
  if (now % 60000 < 100) { // Approximately once per minute
    for (const [key, entry] of Array.from(queryCache.entries())) {
      if (now - entry.timestamp > entry.ttl) {
        queryCache.delete(key);
      }
    }
  }
  
  // Check cache
  const cached = queryCache.get(key);
  if (cached && now - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  
  // Execute query if not cached or expired
  const result = await queryFn();
  queryCache.set(key, { data: result, timestamp: now, ttl });
  return result;
}

export function createClient() {
  return createBrowserClient();
}

// Drop-in replacement for the deprecated createClientComponentClient
export function createClientComponentClient() {
  return createBrowserClient();
}
