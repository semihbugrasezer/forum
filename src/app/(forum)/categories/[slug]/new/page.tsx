'use client';

import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export default function NewTopicPage({ params }: { params: { slug: string } }) {
  const form = useForm<z.infer<typeof formSchema>>({
    // ...existing code...
  });

  // ...existing code...
}
