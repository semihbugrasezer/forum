import { useState } from 'react';
import { TopicContent } from '@/components/TopicContent';
import { CommentSection } from '@/components/CommentSection';
import { useRouter } from 'next/router';

export default function TopicPage() {
  const router = useRouter();
  const { id } = router.query;
  
  if (!id) {
    return <div>Konu yükleniyor...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <TopicContent id={id.toString()} />
      <CommentSection topicId={id.toString()} />
    </div>
  );
}
