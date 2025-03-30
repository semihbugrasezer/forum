import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getTopics } from '@/lib/supabase/server';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import TopicList from '@/app/components/forum/TopicList';
import NoTopicsFound from '@/app/components/NoTopicsFound';

// Force dynamic rendering since this page uses cookies
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Forum Konuları | THY Forum',
  description: 'Türk Hava Yolları hakkında tüm forum konularını keşfedin',
};

export default async function TopicsPage() {
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Forum Konuları</h1>
        <Link href="/topics/new">
          <Button className="flex items-center">
            <FolderPlus className="mr-2 h-4 w-4" />
            Yeni Konu
          </Button>
        </Link>
      </div>

      <Suspense fallback={<TopicsLoadingSkeleton />}>
        <TopicsContent />
      </Suspense>
    </div>
  );
}

async function TopicsContent() {
  try {
    const { data: topics, error } = await getTopics({ limit: 20 });
    
    if (error) {
      console.error('Error fetching topics:', error);
      return <div className="text-red-500">Konular yüklenirken bir hata oluştu.</div>;
    }
    
    if (!topics || topics.length === 0) {
      return <NoTopicsFound />;
    }
    
    return <TopicList topics={topics} />;
  } catch (error) {
    console.error('Unexpected error:', error);
    return <div className="text-red-500">Konular yüklenirken beklenmeyen bir hata oluştu.</div>;
  }
}

function TopicsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="p-4 border rounded-md">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
} 