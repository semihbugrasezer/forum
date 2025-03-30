'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackButton() {
  const router = useRouter();
  
  const handleBack = () => {
    router.back();
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="mb-4 flex items-center hover:bg-muted/50"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span>Geri Dön</span>
    </Button>
  );
} 