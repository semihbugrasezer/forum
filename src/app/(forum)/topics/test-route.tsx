import React from 'react';
import Link from 'next/link';

export default function TestRoute() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-8">Test Topic Routes</h1>
      
      <div className="space-y-4">
        <p>
          Click on the links below to test different topic routes:
        </p>
        
        <ul className="list-disc pl-8 space-y-2">
          <li>
            <Link href="/topics/1" className="text-blue-600 hover:underline">
              Test Topic by ID: 1
            </Link>
          </li>
          <li>
            <Link href="/topics/non-existent-slug" className="text-blue-600 hover:underline">
              Test Non-existent Topic
            </Link>
          </li>
          <li>
            <Link href="/topics/undefined" className="text-blue-600 hover:underline">
              Test "undefined" as slug
            </Link>
          </li>
          <li>
            <Link href="/topics/null" className="text-blue-600 hover:underline">
              Test "null" as slug
            </Link>
          </li>
        </ul>
        
        <div className="mt-8">
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 