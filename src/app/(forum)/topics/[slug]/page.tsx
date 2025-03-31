import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTopicBySlug } from '@/lib/actions/topics';
import TopicDetails from '@/app/components/TopicDetails';
import Comments from '@/app/components/Comments';
import TagList from '@/app/components/TagList';
import BackButton from '@/app/components/ui/BackButton';
import { incrementViewCount } from '@/lib/actions/topics';
import { getComments } from '@/lib/supabase/server';
import CommentForm from './components/CommentForm';

// Force dynamic rendering since this page uses cookies for auth
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Revalidate at every request

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Safely access params
  const slug = params?.slug ? String(params.slug) : '';
  
  try {
    // Try to get the topic
    const topic = await getTopicBySlug(slug);
    
    if (topic) {
      return {
        title: `${topic.title} | Forum`,
        description: topic.content.substring(0, 160)
      };
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
  
  // Fallback metadata
  return {
    title: "Forum Topic",
    description: "View forum topic details and discussions",
  };
}

export async function generateStaticParams() {
  try {
    // This function could pre-generate paths for the most popular topics
    // However, since we're using force-dynamic, this is just to show the proper pattern
    return [];
    
    // Example implementation that would fetch top topics:
    /*
    const supabase = await createClient();
    const { data } = await supabase
      .from('topics')
      .select('slug')
      .order('views', { ascending: false })
      .limit(10);
      
    return (data || []).map(topic => ({
      slug: topic.slug,
    }));
    */
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export default async function TopicPage({ params }: PageProps) {
  // Safely access slug parameter - Next.js 15 requires this pattern
  const slug = params?.slug ? String(params.slug).trim() : '';

  if (!slug || slug === 'undefined' || slug === 'null') {
    console.log("Invalid slug provided:", slug);
    return notFound();
  }

  try {
    console.log(`Fetching topic for slug: ${slug}`);
    const topic = await getTopicBySlug(slug);
    
    if (!topic) {
      console.log(`No topic found for slug: ${slug}`);
      return notFound();
    }

    console.log(`Topic found: ${topic.id}, ${topic.title}`);
    
    // Increment view count in the background after response is sent
    Promise.resolve().then(() => {
      incrementViewCount(topic.id).catch(error => 
        console.error(`Error incrementing view count for topic ${topic.id}:`, error)
      );
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="max-w-4xl mx-auto">
          <TopicDetailSection topic={topic} />
          <TagsSection tags={topic.tags ?? undefined} />
          <CommentsSection topicId={topic.id} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in TopicPage:", error);
    // Return a fallback UI rather than a 404 for certain errors
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          <div className="max-w-4xl mx-auto p-8 bg-red-50 border border-red-200 rounded">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h1>
            <p className="text-red-700">We encountered an error while loading this topic. Please try again later.</p>
            <p className="text-sm text-red-600 mt-2">Error: {(error as Error).message}</p>
          </div>
        </div>
      );
    }
    return notFound();
  }
}

// Separate components to prevent full page failure if one part fails

async function TopicDetailSection({ topic }: { topic: any }) {
  try {
    return <TopicDetails topic={topic} />;
  } catch (error) {
    console.error("Error rendering topic details:", error);
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h2 className="text-xl font-bold text-red-800 mb-2">{topic?.title || 'Topic'}</h2>
        <p className="text-red-700">Topic details could not be fully loaded.</p>
      </div>
    );
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
    let comments: any[] = [];
    try {
      comments = await getComments(topicId);
    } catch (error) {
      console.error("Error loading comments:", error);
      comments = []; // Ensure we have an empty array if fetching fails
    }

    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Comments</h3>
        {comments.length > 0 ? (
          <Comments comments={comments} topicId={topicId} />
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
        <div className="mt-4">
          <CommentForm topicId={topicId} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering comments section:", error);
    return (
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-xl font-bold mb-2">Comments</h3>
        <p className="text-red-700">Comments could not be loaded.</p>
        <div className="mt-4">
          <CommentForm topicId={topicId} />
        </div>
      </div>
    );
  }
}
