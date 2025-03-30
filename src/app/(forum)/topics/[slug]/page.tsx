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

interface PageProps {
  params: {
    slug: string;
  };
}

export const metadata: Metadata = {
  title: "Forum Topic",
  description: "View forum topic details and discussions",
};

export default async function TopicPage({ params }: PageProps) {
  const { slug } = params;

  if (!slug) {
    return notFound();
  }

  try {
    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      return notFound();
    }

    const topic = await getTopicBySlug(trimmedSlug);
    if (!topic) {
      return notFound();
    }

    // Increment view count in the background
    Promise.resolve().then(() => {
      incrementViewCount(topic.id).catch(console.error);
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
    console.error("Error fetching topic:", error);
    return notFound();
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
    let comments: any[] = [];
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
