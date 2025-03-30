'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addComment } from '@/lib/actions/comments';
import { useToast } from '@/components/ui/use-toast';

interface CommentFormProps {
  topicId: string;
}

export default function CommentForm({ topicId }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Comment is required',
        description: 'Please enter a comment',
        variant: 'destructive',
      });
      return;
    }

    if (!authorName.trim()) {
      toast({
        title: 'Name is required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await addComment({
        topicId,
        content: content.trim(),
        authorName: authorName.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to add comment');
      }
      
      // Clear form after successful submission
      setContent('');
      setAuthorName('');
      
      toast({
        title: 'Comment added',
        description: 'Your comment has been added successfully',
      });

    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Failed to add comment',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Your Name
        </label>
        <Input
          id="name"
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Enter your name"
          required
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Comment
        </label>
        <Textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 min-h-[100px]"
          placeholder="Share your thoughts..."
          required
          disabled={isSubmitting}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Post Comment'}
      </Button>
    </form>
  );
} 