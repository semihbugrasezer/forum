import { redirect } from 'next/navigation';

/**
 * Redirects to the proper topic page using the topic ID
 * This helps maintain SEO value by consolidating URLs
 */
export default async function ForumTopicsRedirect({
  params,
}: {
  params: { id: string };
}) {
  // In Next.js 13+, await params
  const { id } = await params;
  
  console.log('Redirecting topic with ID:', id);

  // Use permanent redirect for SEO benefit (301 instead of 307)
  redirect(`/topics/${id}`);
}