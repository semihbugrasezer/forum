'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TopicError({ error, reset }: ErrorProps) {
  // Log the error to help with debugging
  console.error('Topic page error:', error);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg overflow-hidden p-6 text-center">
        <svg 
          className="h-16 w-16 text-red-500 mx-auto mb-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Bir Şeyler Yanlış Gitti
        </h1>
        
        <p className="text-gray-600 mb-6">
          Bu konuyu yüklerken bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Tekrar Dene
          </Button>
          
          <Link href="/" passHref>
            <Button variant="outline" className="border-blue-600 text-blue-600">
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>
        
        {error.digest && (
          <p className="mt-6 text-xs text-gray-500">
            Referans kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
} 