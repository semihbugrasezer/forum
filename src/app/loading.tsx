'use client';

import React from 'react';

/**
 * Optimized loading component for high traffic
 * Uses lightweight CSS animations instead of heavy libraries
 * No external dependencies to reduce bundle size
 */
export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="max-w-7xl w-full mx-auto">
        {/* Header skeleton */}
        <div className="w-full flex justify-between items-center mb-8">
          <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="flex gap-4">
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded-md"></div>
            
            <div className="h-32 w-full bg-gray-200 animate-pulse rounded-md mt-6"></div>
            
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md mt-6"></div>
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-4 w-4/5 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-4">
            <div className="h-40 w-full bg-gray-200 animate-pulse rounded-md"></div>
            <div className="h-60 w-full bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
        
        {/* Load indicator with reduced motion for accessibility */}
        <div className="flex justify-center mt-8" role="status" aria-label="Loading">
          <div className="inline-block relative w-10 h-10">
            <div className="absolute border-4 border-gray-200 rounded-full h-10 w-10"></div>
            <div className="absolute border-4 border-red-500 rounded-full h-10 w-10 border-t-transparent animate-spin"></div>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    </div>
  );
} 