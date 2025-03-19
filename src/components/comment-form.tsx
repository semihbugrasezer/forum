'use client';

import { useActionState } from 'react';
import { addComment } from '@/lib/actions/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentFormProps {
  topicId: string;
}

export function CommentForm({ topicId }: CommentFormProps) {
  const [state, formAction] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await addComment(formData);
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="topicId" value={topicId} />
      <Textarea
        name="content"
        placeholder="Yorumunuzu yazın..."
        required
        minLength={3}
      />
      <Button type="submit">Yorum Gönder</Button>
      {state?.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}
    </form>
  );
} 