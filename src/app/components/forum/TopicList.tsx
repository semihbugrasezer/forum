'use client';

import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { MessageSquare, ThumbsUp, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Topic {
  id: string;
  title: string;
  content: string;
  slug: string;
  created_at: string;
  comment_count: number;
  like_count: number;
  view_count: number;
  tags?: string[];
  author?: {
    full_name?: string;
    email?: string;
  };
  category?: {
    name?: string;
  };
}

interface TopicListProps {
  topics: Topic[];
}

export default function TopicList({ topics }: TopicListProps) {
  if (!topics || topics.length === 0) {
    return null;
  }

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <Link href={`/topics/${topic.slug}`} className="block">
              <h2 className="text-xl font-semibold mb-2 hover:text-primary">
                {topic.title}
              </h2>
              <p className="text-muted-foreground line-clamp-2 mb-3">
                {topic.content.substring(0, 160)}
                {topic.content.length > 160 ? '...' : ''}
              </p>
            </Link>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {topic.tags && topic.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <span>{topic.author?.full_name || topic.author?.email || 'Anonim'}</span>
              {topic.category?.name && (
                <>
                  <span className="mx-2">•</span>
                  <span>{topic.category.name}</span>
                </>
              )}
              <span className="mx-2">•</span>
              <span>{getTimeAgo(topic.created_at)}</span>
            </div>
          </CardContent>
          
          <CardFooter className="border-t py-3 text-xs text-muted-foreground">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{topic.comment_count}</span>
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{topic.like_count}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{topic.view_count}</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 