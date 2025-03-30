import { redirect } from 'next/navigation';

export default async function TopicPage({ params }: { params: { slug: string } }) {
  // Next.js expects params to be a regular object, not a Promise
  const { slug } = params;
  
  try {
    // Redirect to the correct plural route using slug
    redirect(`/topics/${slug}`);
  } catch (error) {
    // Error handling...
    console.error("Error redirecting:", error);
    return <div>Error redirecting to topic page</div>;
  }
}
