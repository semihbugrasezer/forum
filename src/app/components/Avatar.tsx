'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

// In-memory cache for avatar URLs to reduce redundant fetches
// This will persist between component renders
const avatarCache = new Map<string, { url: string, timestamp: number }>();
const AVATAR_CACHE_TTL = 1000 * 60 * 10; // 10 minutes

// Maximum cache size to prevent memory leaks
const MAX_CACHE_SIZE = 1000;

// Clean cache periodically
if (typeof window !== 'undefined') {
  const cleanCache = () => {
    const now = Date.now();
    let expiredCount = 0;
    
    // Remove expired entries
    for (const [key, entry] of avatarCache.entries()) {
      if (now - entry.timestamp > AVATAR_CACHE_TTL) {
        avatarCache.delete(key);
        expiredCount++;
      }
    }
    
    // If cache is still too large, remove oldest entries
    if (avatarCache.size > MAX_CACHE_SIZE) {
      const entriesToRemove = avatarCache.size - MAX_CACHE_SIZE;
      const entries = Array.from(avatarCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, entriesToRemove);
      
      for (const [key] of entries) {
        avatarCache.delete(key);
      }
    }
    
    // Log cache stats in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Avatar cache cleaned: ${expiredCount} expired, ${avatarCache.size} remaining`);
    }
  };
  
  // Clean cache every 5 minutes
  setInterval(cleanCache, 5 * 60 * 1000);
}

interface AvatarProps {
  userId?: string;
  url?: string;
  size?: number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';  // Allow semantic sizes
  className?: string;
  priority?: boolean; // For LCP optimization
}

export default function Avatar({ 
  userId, 
  url, 
  size = 'md', 
  className = '',
  priority = false
}: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  // Convert semantic sizes to numeric values
  const sizeInPixels = useMemo(() => {
    if (typeof size === 'number') return size;
    
    switch(size) {
      case 'xs': return 24;
      case 'sm': return 32;
      case 'md': return 40;
      case 'lg': return 56;
      case 'xl': return 80;
      default: return 40;
    }
  }, [size]);

  // Generate a cache key for this avatar
  const cacheKey = userId ? `avatar_${userId}` : url ? `url_${url}` : '';

  useEffect(() => {
    async function downloadImage() {
      try {
        setLoading(true);
        setError(false);

        // Try cache first
        if (cacheKey) {
          const cached = avatarCache.get(cacheKey);
          if (cached && (Date.now() - cached.timestamp < AVATAR_CACHE_TTL)) {
            setAvatarUrl(cached.url);
            setLoading(false);
            return;
          }
        }

        if (url) {
          // If URL is provided directly, use it
          setAvatarUrl(url);
          if (cacheKey) {
            avatarCache.set(cacheKey, { url, timestamp: Date.now() });
          }
          setLoading(false);
          return;
        }

        if (!userId) {
          // If no userId and no url, there's nothing to fetch
          setLoading(false);
          return;
        }

        // Try to fetch avatar from Supabase storage
        const supabase = createClient();
        
        // Make sure userId is valid before querying
        if (!userId || userId === 'undefined' || userId === 'null') {
          setLoading(false);
          setError(true);
          return;
        }
        
        // Optimize query to only fetch what we need
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url, name')  // Using 'name' instead of 'full_name' based on database.types.ts
          .eq('id', userId)
          .maybeSingle();  // Better than single() as it doesn't throw an error

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setLoading(false);
          setError(true);
          return;
        }

        if (!profile || !profile.avatar_url) {
          setLoading(false);
          return;
        }

        // If profile has an avatar_url that's a direct URL, use it directly
        if (profile.avatar_url && profile.avatar_url.startsWith('http')) {
          setAvatarUrl(profile.avatar_url);
          avatarCache.set(cacheKey, { 
            url: profile.avatar_url, 
            timestamp: Date.now() 
          });
          setLoading(false);
          return;
        }

        // If profile has an avatar_url, download it
        if (profile.avatar_url) {
          try {
            // For better performance with many users, use public URLs instead of downloading blobs
            const { data: publicUrl } = supabase
              .storage
              .from('avatars')
              .getPublicUrl(profile.avatar_url);
              
            if (publicUrl?.publicUrl) {
              setAvatarUrl(publicUrl.publicUrl);
              // Cache the resolved URL
              avatarCache.set(cacheKey, { 
                url: publicUrl.publicUrl, 
                timestamp: Date.now() 
              });
            } else {
              // Fallback to download if public URL fails
              const { data, error } = await supabase.storage
                .from('avatars')
                .download(profile.avatar_url);

              if (error || !data) {
                throw error || new Error('No avatar data');
              }

              const objectUrl = URL.createObjectURL(data);
              setAvatarUrl(objectUrl);
              // Don't cache blob URLs as they're session-specific
            }
          } catch (storageError) {
            console.error('Error downloading avatar:', storageError);
            setError(true);
          }
        }
      } catch (err) {
        console.error('Avatar error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    // Skip download if already loaded from cache
    const cached = cacheKey ? avatarCache.get(cacheKey) : null;
    if (cached && (Date.now() - cached.timestamp < AVATAR_CACHE_TTL)) {
      setAvatarUrl(cached.url);
      setLoading(false);
    } else {
      downloadImage();
    }

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [userId, url, cacheKey]);

  // Generate initials for the fallback
  const getInitials = () => {
    if (!userId) return '?';
    return userId.substring(0, 2).toUpperCase();
  };

  // Responsive container styles with Tailwind classes instead of inline styles
  const containerClasses = `
    ${className}
    relative overflow-hidden rounded-full
    flex items-center justify-center
    ${error || !avatarUrl ? 'bg-gray-200 text-gray-600 font-semibold' : ''}
    ${loading ? 'bg-gray-100' : ''}
  `;

  if (loading) {
    return (
      <div 
        className={`${containerClasses} avatar-loading`}
        style={{ width: sizeInPixels, height: sizeInPixels }}
      >
        <div className="absolute inset-0 animate-pulse bg-gray-200"></div>
      </div>
    );
  }

  if (error || !avatarUrl) {
    return (
      <div 
        className={`${containerClasses} avatar-fallback`}
        style={{ 
          width: sizeInPixels, 
          height: sizeInPixels,
          fontSize: `${sizeInPixels / 2.5}px`
        }}
      >
        {getInitials()}
      </div>
    );
  }

  return (
    <div 
      className={`${containerClasses} avatar`}
      style={{ width: sizeInPixels, height: sizeInPixels }}
    >
      <Image 
        src={avatarUrl}
        alt="User avatar"
        fill
        sizes={`${sizeInPixels}px`}
        priority={priority}
        className="object-cover"
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
} 