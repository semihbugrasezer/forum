import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import BackButton from '@/app/components/ui/BackButton';

export default function TopicLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton />
      
      <div className="max-w-4xl mx-auto">
        {/* Topic Header Skeleton */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-7 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
          
          {/* Topic Content Skeleton */}
          <div className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-5/6" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
            </div>
          </div>
          
          {/* Tags Skeleton */}
          <div className="px-6 pb-4 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
        
        {/* Comments Skeleton */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32" />
          </div>
          
          {/* Comment Items */}
          <div className="divide-y divide-border">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-4 sm:p-5">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Comment Form Skeleton */}
          <div className="p-4 sm:p-5 border-t">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-24 w-full mb-3" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
} 