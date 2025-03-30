import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTopicBySlug } from '@/lib/actions/topics';
import { getComments } from '@/lib/actions/comments';
import TopicDetails from '@/app/components/TopicDetails';
import Comments from '@/app/components/Comments';
import CommentForm from '@/app/components/CommentForm';
import TagList from '@/app/components/TagList';
import BackButton from '@/app/components/ui/BackButton';
import { incrementViewCount } from '@/lib/actions/topics';
import { getTopicBySlug as serverGetTopicBySlug } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Database, FolderPlus, AlertCircle } from 'lucide-react';

// Force dynamic rendering since this page uses cookies for auth
export const dynamic = 'force-dynamic';

export const revalidate = 0; // Revalidate at every request

interface PageProps {
  params: {
    slug: string;
  };
}

// Fallback metadata
export const metadata: Metadata = {
  title: "Forum Topic",
  description: "View forum topic details and discussions",
};

export default async function TopicPage({ params }: PageProps) {
  try {
    // Get the slug directly from params
    const { slug } = params;
    
    if (!slug) {
      console.error("Missing slug parameter");
      notFound();
    }
    
    console.log("Processing topic with slug:", slug);
    
    // Try to get the topic - first with actions/topics.ts, then with supabase/server.ts as fallback
    let topic = await getTopicBySlug(slug);
    
    // If topic was not found with the first method, try the second method
    if (!topic) {
      console.log("Topic not found with actions/topics.ts, trying with server.ts");
      topic = await serverGetTopicBySlug(slug);
    }
    
    if (!topic) {
      console.error(`Topic not found for slug: ${slug}`);
      
      // Try to check if there are any topics in the database
      const supabase = (await import('@/lib/supabase/server')).createClient;
      const client = await supabase();
      const { data: anyTopics } = await client.from('topics').select('id').limit(1);
      
      if (!anyTopics || anyTopics.length === 0) {
        console.error("No topics found in database - please add some content first");
        return (
          <div className="container mx-auto py-16 px-4 text-center">
            <div className="max-w-md mx-auto">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-4">Henüz İçerik Yok</h1>
              <p className="text-muted-foreground mb-8">
                Veritabanında henüz hiç konu bulunmuyor. Forum tartışmalarına başlamak için içerik ekleyebilirsiniz.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild className="flex items-center justify-center">
                  <Link href="/topics/new">
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Yeni Konu Oluştur
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center justify-center">
                  <Link href="/admin/seed">
                    <Database className="mr-2 h-4 w-4" />
                    Örnek Konular Ekle
                  </Link>
                </Button>
              </div>
              <div className="mt-8">
                <BackButton />
              </div>
            </div>
          </div>
        );
      }
      
      notFound();
    }

    // Increment view count without blocking the page render
    try {
      incrementViewCount(topic.id).catch(error => {
        console.error("Error incrementing view count:", error);
      });
    } catch (viewError) {
      console.error("Error calling incrementViewCount:", viewError);
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="max-w-4xl mx-auto">
          {/* Topic Details Section */}
          <TopicDetailSection topic={topic} />
          
          {/* Tags Section */}
          <TagsSection tags={topic.tags} />
          
          {/* Comments Section */}
          <CommentsSection topicId={topic.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading topic page:", error);
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-4">Error Loading Topic</h1>
        <p className="text-red-500 mb-4">There was an error loading this topic. Please try again later.</p>
        <BackButton />
      </div>
    );
  }
}

// Separate components to prevent full page failure if one part fails

async function TopicDetailSection({ topic }: { topic: any }) {
  try {
    return <TopicDetails topic={topic} />;
  } catch (error) {
    console.error("Error rendering topic details:", error);
    return <div className="p-4 bg-red-50 border border-red-200 rounded">Topic details could not be loaded.</div>;
  }
}

function TagsSection({ tags }: { tags?: string[] }) {
  try {
    if (!tags || tags.length === 0) return null;
    return (
      <div className="mt-6">
        <TagList tags={tags} />
      </div>
    );
  } catch (error) {
    console.error("Error rendering tags:", error);
    return null;
  }
}

async function CommentsSection({ topicId }: { topicId: string }) {
  try {
    // Try to get comments, but don't fail the page if comments fail
    let comments = [];
    try {
      comments = await getComments(topicId);
    } catch (error) {
      console.error("Error loading comments:", error);
    }

    return (
      <div className="mt-8">
        <Comments comments={comments} topicId={topicId} />
        <div className="mt-4">
          <CommentForm topicId={topicId} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering comments section:", error);
    return <div className="p-4 bg-red-50 border border-red-200 rounded">Comments could not be loaded.</div>;
  }
}
