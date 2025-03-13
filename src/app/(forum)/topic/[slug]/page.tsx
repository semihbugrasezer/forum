import { redirect } from 'next/navigation';

export default function TopicPage({ params }: { params: { slug: string } }) {
  // Redirect to the correct plural route using slug
  redirect(`/topics/${params.slug}`);
}
