import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ForumPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto px-4 py-8">
        <h1>Forum</h1>
        {/* Add your forum content here */}
      </div>
    </Suspense>
  );
}