'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { addComment } from '@/lib/actions/comments';
import { useRouter } from 'next/navigation';

interface CommentFormProps {
  topicId: string;
}

export default function CommentForm({ topicId }: CommentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    authorName: '',
    commentContent: ''
  });

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    // Basic validation
    if (!formData.commentContent.trim()) {
      setError('Lütfen bir yorum yazın.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const form = new FormData();
      form.append('topicId', topicId);
      form.append('authorName', formData.authorName.trim());
      form.append('commentContent', formData.commentContent.trim());
      
      const result = await addComment(form);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        // Reset the form data
        setFormData({
          authorName: '',
          commentContent: ''
        });
        // Refresh the page to show the new comment
        router.refresh();
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
            value={formData.authorName}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Textarea 
            name="commentContent"
            placeholder="Yorumunuzu buraya yazın..."
            required
            className="w-full min-h-[100px]"
            disabled={isSubmitting}
            value={formData.commentContent}
            onChange={handleChange}
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