import { redirect } from 'next/navigation';

export default async function TopicPage({ params }: { params: { slug: string } }) {
  // Next.js 13+'da params objesi await edilmelidir
  const { slug } = await params;
  
  try {
    // Redirect to the correct plural route using slug
    redirect(`/topics/${slug}`);
  } catch (error) {
    // Error handling...
  }
}
