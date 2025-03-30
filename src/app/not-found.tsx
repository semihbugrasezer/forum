"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h2 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h2>
      <p className="text-gray-600 mb-6">
        Aradığınız sayfa bulunamadı veya kaldırılmış olabilir.
      </p>
      <Link 
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}