import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function TopicPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerClient()
  
  const { data: topic, error } = await supabase
    .from('topics')
    .select('*, author:profiles(*)')
    .eq('slug', params.slug)
    .single()

  if (error || !topic) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-6">
      <h1 className="text-3xl font-bold mb-6">{topic.title}</h1>
      <div className="prose dark:prose-invert max-w-none">
        {topic.content}
      </div>
    </div>
  )
}
