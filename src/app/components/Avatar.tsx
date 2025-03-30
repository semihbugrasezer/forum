'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

interface AvatarProps {
  userId?: string;
  url?: string;
  size?: number;
  className?: string;
}

export default function Avatar({ userId, url, size = 40, className = '' }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function downloadImage() {
      try {
        setLoading(true);
        setError(false);

        if (url) {
          // If URL is provided directly, use it
          setAvatarUrl(url);
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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', userId)
          .single();

        if (profileError || !profile?.avatar_url) {
          setLoading(false);
          return;
        }

        // If profile has an avatar_url, download it
        if (profile.avatar_url) {
          try {
            const { data, error } = await supabase.storage
              .from('avatars')
              .download(profile.avatar_url);

            if (error || !data) {
              throw error || new Error('No avatar data');
            }

            const objectUrl = URL.createObjectURL(data);
            setAvatarUrl(objectUrl);
          } catch (storageError) {
            console.error('Error downloading avatar:', storageError);
            // If storage fails but we have a URL, try using it directly
            if (profile.avatar_url.startsWith('http')) {
              setAvatarUrl(profile.avatar_url);
            }
          }
        }
      } catch (err) {
        console.error('Avatar error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    downloadImage();

    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (avatarUrl && avatarUrl.startsWith('blob:')) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [userId, url]);

  // Generate initials for the fallback
  const getInitials = () => {
    if (!userId) return '?';
    return userId.substring(0, 2).toUpperCase();
  };

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: error || !avatarUrl ? '#e2e8f0' : 'transparent',
    color: '#64748b',
    fontWeight: 'bold',
    fontSize: size / 2.5,
  };

  if (loading) {
    return (
      <div 
        style={containerStyle} 
        className={`avatar-loading ${className}`}
      >
        <div className="animate-pulse bg-gray-200 w-full h-full"></div>
      </div>
    );
  }

  if (error || !avatarUrl) {
    return (
      <div 
        style={containerStyle} 
        className={`avatar-fallback ${className}`}
      >
        {getInitials()}
      </div>
    );
  }

  return (
    <div 
      style={containerStyle} 
      className={`avatar ${className}`}
    >
      <Image 
        src={avatarUrl}
        alt="User avatar"
        width={size}
        height={size}
        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
      />
    </div>
  );
} 