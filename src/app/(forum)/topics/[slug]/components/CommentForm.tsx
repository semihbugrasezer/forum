'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addComment } from '@/lib/actions/comments';

interface CommentFormProps {
  topicId: string;
}

export default function CommentForm({ topicId }: CommentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData(event.currentTarget);
      formData.append('topicId', topicId);
      
      const result = await addComment(formData);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Reset the form
        (event.target as HTMLFormElement).reset();
      }
    } catch (err) {
      setError('Yorum eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Comment submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-5 border-t border-border">
      <h3 className="text-base font-medium mb-3">Yorum Ekle</h3>
      
      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-800 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-3 p-3 bg-green-100 text-green-800 rounded-md text-sm">
          Yorumunuz başarıyla eklendi!
        </div>
      )}
      
      <div className="space-y-3">
        <div>
          <Input 
            type="text"
            name="authorName"
            placeholder="İsminiz"
            required
            className="w-full"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <Textarea 
            name="commentContent"
            placeholder="Yorumunuzu buraya yazın..."
            required
            className="w-full min-h-[100px]"
            disabled={isSubmitting}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
        </Button>
      </div>
    </form>
  );
} 