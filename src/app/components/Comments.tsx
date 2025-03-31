import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import { getTimeAgo } from '@/lib/utils';
import CommentForm from '@/app/components/CommentForm';

interface Author {
  id?: string;
  full_name?: string;
  name?: string;
  email?: string;
  avatar_url?: string | null;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  topic_id: string;
  author?: Author;
  author_name?: string;
  user_id?: string;
  profiles?: Author;
}

interface CommentsProps {
  comments: Comment[];
  topicId: string;
}

export default function Comments({ comments, topicId }: CommentsProps) {
  // Ensure we have a valid comments array
  const safeComments = Array.isArray(comments) ? comments : [];
  
  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <header className="p-3 sm:p-4 border-b border-border">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-primary" />
          <span>Yorumlar ({safeComments.length})</span>
        </h2>
      </header>

      <div className="divide-y divide-border">
        {/* Display Comments */}
        {safeComments.length > 0 ? (
          safeComments.map((comment) => {
            // Get author display name with multiple fallbacks
            const authorName = 
              comment.author?.full_name || 
              comment.author_name || 
              comment.profiles?.name || 
              (comment.author?.email ? comment.author.email.split('@')[0] : null) ||
              'Anonymous';
              
            // Get avatar initials with fallbacks
            const avatarInitials = 
              (authorName && authorName !== 'Anonymous' ? authorName.substring(0, 2).toUpperCase() : 'AN');
            
            return (
              <div key={comment.id} className="p-4 sm:p-5">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback>
                      {avatarInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">
                        {authorName}
                      </h3>
                      <time className="text-xs text-muted-foreground">
                        {getTimeAgo(new Date(comment.created_at))}
                      </time>
                    </div>
                    <p className="text-sm text-foreground/90">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            <p>Henüz yorum bulunmuyor. İlk yorum yapan siz olun!</p>
          </div>
        )}
      </div>

      {/* Comment Form */}
      <CommentForm topicId={topicId} />
    </section>
  );
} 