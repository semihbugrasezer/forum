import { redirect } from 'next/navigation';

export default async function ForumTopicRedirect({ params }: { params: { id: string } }) {
  // Next.js 13+'da params objesi await edilmelidir
  const { id } = await params;
  
  // Redirect to the correct route for topics
  redirect(`/topics/${id}`);
} 