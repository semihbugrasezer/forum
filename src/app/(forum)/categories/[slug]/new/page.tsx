'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useParams } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export default function NewTopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const form = useForm<z.infer<typeof formSchema>>({
    // ...existing code...
  });

  // ...existing code...
}
