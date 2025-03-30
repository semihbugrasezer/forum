import React from 'react';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from './Avatar';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/utils';

interface TopicDetailsProps {
  topic: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at?: string;
    author?: {
      id: string;
      full_name?: string;
      email?: string;
    };
    category?: {
      id: string;
      name: string;
    };
    view_count: number;
    like_count: number;
    comment_count: number;
    tags?: string[];
  };
}

export default function TopicDetails({ topic }: TopicDetailsProps) {
  if (!topic) {
    return <div className="text-center p-8">Konu bulunamadı</div>;
  }

  const authorName = topic.author?.full_name || topic.author?.email?.split('@')[0] || 'Anonim Kullanıcı';
  const createdAt = topic.created_at ? new Date(topic.created_at) : new Date();
  const timeAgo = formatDistance(createdAt, new Date(), { addSuffix: true, locale: tr });

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Topic Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar userId={topic.author?.id} size={40} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <span>
                  {authorName} tarafından {timeAgo}
                </span>
                {topic.category && (
                  <>
                    <span className="mx-2">•</span>
                    <Link 
                      href={`/categories/${topic.category.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {topic.category.name}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              <span>{topic.view_count}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
              </svg>
              <span>{topic.comment_count}</span>
            </div>
            
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span>{topic.like_count}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Topic Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          {topic.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </div>

      {topic.tags && topic.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {topic.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
} 