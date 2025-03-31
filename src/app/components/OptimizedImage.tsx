'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Types for responsive image handling
interface ImageManifestEntry {
  formats: Record<string, string>;
  responsive: Array<{
    width: number;
    format: string;
    path: string;
  }>;
  placeholder?: string;
}

interface ImageManifest {
  version: number;
  generated: string;
  images: Record<string, ImageManifestEntry>;
}

// Props for the OptimizedImage component
interface OptimizedImageProps {
  // Key from image manifest or path to image
  src: string;
  // Alternative text for accessibility
  alt: string;
  // Width of the image
  width?: number;
  // Height of the image
  height?: number;
  // Use fill mode
  fill?: boolean;
  // Additional class names
  className?: string;
  // Style object
  style?: React.CSSProperties;
  // Priority loading for LCP (above the fold)
  priority?: boolean;
  // Lazy loading boundary
  loading?: 'lazy' | 'eager';
  // Quality for next/image
  quality?: number;
  // Sizing for next/image
  sizes?: string;
  // OnLoad handler
  onLoad?: () => void;
  // Disable placeholder
  disablePlaceholder?: boolean;
}

// Global manifest cache for performance
let manifestCache: ImageManifest | null = null;
let manifestLoading = false;
let manifestLoadPromise: Promise<ImageManifest | null> | null = null;

// Check browser WebP support
let webpSupported: boolean | null = null;

// Detect browser WebP support
const detectWebPSupport = (): Promise<boolean> => {
  if (webpSupported !== null) return Promise.resolve(webpSupported);
  
  return new Promise<boolean>((resolve) => {
    if (typeof window === 'undefined') {
      // Default to true on server
      resolve(true);
      return;
    }
    
    const img = new Image();
    img.onload = function() {
      webpSupported = (img.width > 0) && (img.height > 0);
      resolve(webpSupported);
    };
    img.onerror = function() {
      webpSupported = false;
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
};

// Function to load the image manifest
async function loadImageManifest(): Promise<ImageManifest | null> {
  if (manifestCache) return manifestCache;
  if (manifestLoadPromise) return manifestLoadPromise;

  manifestLoading = true;
  manifestLoadPromise = fetch('/optimized/manifest.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load image manifest');
      return res.json();
    })
    .then(data => {
      manifestCache = data;
      return data;
    })
    .catch(err => {
      console.error('Error loading image manifest:', err);
      return null;
    })
    .finally(() => {
      manifestLoading = false;
      manifestLoadPromise = null;
    });

  return manifestLoadPromise;
}

// Prefetch critical images when idle
if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
  window.requestIdleCallback(() => {
    loadImageManifest().then(manifest => {
      if (!manifest) return;
      
      // Prefetch priority images to optimize loading
      detectWebPSupport().then(webpSupported => {
        // Find images marked with higher priority
        const priorityImages = Object.entries(manifest.images)
          // Skip first 5 priority images to avoid overloading
          .slice(0, 5)
          .map(([_, entry]) => {
            const format = webpSupported && entry.formats.webp 
              ? entry.formats.webp 
              : entry.formats.jpg || entry.formats.png;
              
            if (!format) return null;
            return `/optimized/${format}`;
          })
          .filter(Boolean);
          
        // Prefetch priority images
        for (const imgSrc of priorityImages) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.as = 'image';
          link.href = imgSrc;
          document.head.appendChild(link);
        }
      });
    });
  }, { timeout: 5000 });
}

/**
 * OptimizedImage component for high-traffic sites
 * 
 * This component:
 * 1. Automatically uses WebP/AVIF if supported
 * 2. Provides responsive sizes based on breakpoints
 * 3. Uses blur placeholders for better loading experience
 * 4. Falls back to original images if optimized versions aren't available
 * 5. Prefetches critical images on idle
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = '',
  style = {},
  priority = false,
  loading = 'lazy',
  quality = 85,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  disablePlaceholder = false,
}: OptimizedImageProps) {
  const [manifest, setManifest] = useState<ImageManifest | null>(null);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  // Load the manifest when component mounts
  useEffect(() => {
    if (!manifest && !manifestLoading) {
      loadImageManifest().then(data => {
        if (data) setManifest(data);
      });
    }
  }, [manifest]);

  // Normalize the source key to match manifest format
  const srcKey = useMemo(() => {
    if (!src) return '';
    
    // Handle absolute URLs
    if (src.startsWith('http')) return src;
    
    // Strip leading slash and file extension
    let normalizedSrc = src.startsWith('/') ? src.substring(1) : src;
    
    // Remove file extension if present
    const lastDotIndex = normalizedSrc.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      normalizedSrc = normalizedSrc.substring(0, lastDotIndex);
    }
    
    return normalizedSrc;
  }, [src]);

  // Find image in manifest
  const imageEntry = useMemo(() => {
    if (!manifest || !srcKey || srcKey.startsWith('http')) return null;
    return manifest.images[srcKey] || null;
  }, [manifest, srcKey]);

  // Determine image source URLs based on manifest
  const {
    imageSrc,
    placeholderSrc,
    srcSet,
    hasOptimizedVersions
  } = useMemo(() => {
    // For external URLs, just use the source directly
    if (src.startsWith('http')) {
      return {
        imageSrc: src,
        placeholderSrc: null,
        srcSet: null,
        hasOptimizedVersions: false
      };
    }

    // If we have manifest data for this image
    if (imageEntry) {
      // Choose optimal format based on browser support
      const getOptimalFormat = () => {
        if (webpSupported === true && imageEntry.formats.webp) {
          return imageEntry.formats.webp;
        } else if (imageEntry.formats.avif) {
          return imageEntry.formats.avif;
        } else if (imageEntry.formats.jpg) {
          return imageEntry.formats.jpg;
        } else if (imageEntry.formats.jpeg) {
          return imageEntry.formats.jpeg;
        } else if (imageEntry.formats.png) {
          return imageEntry.formats.png;
        }
        return null;
      };
      
      const optimalFormat = getOptimalFormat();
      const mainSrc = optimalFormat ? `/optimized/${optimalFormat}` : src;
      
      // Get responsive sources
      const srcSetEntries = imageEntry.responsive
        .sort((a, b) => a.width - b.width)
        .map(item => `${window.location.origin}/optimized/${item.path} ${item.width}w`);
      
      return {
        imageSrc: mainSrc,
        placeholderSrc: imageEntry.placeholder ? `/optimized/${imageEntry.placeholder}` : null,
        srcSet: srcSetEntries.length > 0 ? srcSetEntries.join(', ') : null,
        hasOptimizedVersions: true
      };
    }

    // Fallback to original image
    return {
      imageSrc: src,
      placeholderSrc: null,
      srcSet: null,
      hasOptimizedVersions: false
    };
  }, [src, imageEntry, webpSupported]);

  // Load the placeholder
  useEffect(() => {
    if (!placeholderSrc || disablePlaceholder || priority) return;
    
    const img = new window.Image();
    img.onload = () => setPlaceholderLoaded(true);
    img.onerror = () => setPlaceholderLoaded(false);
    img.src = placeholderSrc;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [placeholderSrc, disablePlaceholder, priority]);

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleImageError = () => {
    setIsError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Show skeleton during loading if no placeholder
  if (!priority && !placeholderLoaded && !imageLoaded && !placeholderSrc && !isError) {
    return (
      <div 
        className={cn(
          "bg-gray-200 animate-pulse rounded overflow-hidden",
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style
        }}
        role="presentation"
        aria-hidden="true"
      />
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        ...style
      }}
    >
      {/* Placeholder with blur-up effect */}
      {!disablePlaceholder && placeholderSrc && placeholderLoaded && !imageLoaded && !isError && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
          style={{ 
            backgroundImage: `url(${placeholderSrc})`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
            opacity: imageLoaded ? 0 : 1
          }}
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : (width || undefined)}
        height={fill ? undefined : (height || undefined)}
        fill={fill}
        sizes={hasOptimizedVersions && srcSet ? sizes : undefined}
        quality={quality}
        priority={priority}
        loading={loading}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          "transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0",
          !placeholderLoaded && !disablePlaceholder ? "opacity-0" : "",
          fill ? "object-cover" : ""
        )}
      />
    </div>
  );
} 