'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Adsense } from '@/components/ads/adsense';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { createSlug } from "@/lib/utils";

type Category = {
  title: string;
  slug: string;
  count: number;
};

type Topic = {
  id: number;
  title: string;
  author: string;
  time: string;
  timestamp: string;
  comments: number;
};

type HomeClientProps = {
  categories: readonly Category[];
  TopicCard: React.ComponentType<{ topic: Topic }>;
};

export function HomeClient({ categories, TopicCard }: HomeClientProps) {
  const { user, isLoading } = useAuth();
  
  // Sample data for topics
  const recentTopics = [
    {
      id: 1,
      title: "Miles&Smiles Kart Yükseltme Hakkında",
      author: "ahmet_yilmaz",
      time: "5 dakika önce",
      timestamp: "2024-03-16T10:30:00",
      comments: 12
    },
    {
      id: 2,
      title: "IST-JFK Business Class Deneyimim",
      author: "meryem_k",
      time: "2 saat önce",
      timestamp: "2024-03-16T08:45:00",
      comments: 8
    }
  ];
  
  const popularTopics = [
    {
      id: 3,
      title: "Yeni Lounge İstanbul Hakkında",
      author: "can_demir",
      time: "1 gün önce",
      timestamp: "2024-03-15T14:30:00",
      comments: 45
    },
    {
      id: 4,
      title: "Miles&Smiles Elite Plus Avantajları",
      author: "zeynep_a",
      time: "2 gün önce",
      timestamp: "2024-03-14T09:15:00",
      comments: 32
    }
  ];
  
  return (
    <>
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold">THY Forum</h1>
        </div>
        <div className="flex items-center gap-4">
          {isLoading ? (
            <Button disabled variant="outline">Yükleniyor...</Button>
          ) : user ? (
            <Button asChild>
              <Link href="/new-topic">Yeni Konu</Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <AuthModal>
                <Button variant="default">Giriş Yap</Button>
              </AuthModal>
              <Button asChild variant="outline">
                <Link href="/new-topic">Yeni Konu</Link>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </header>
      
      {/* Top Ad */}
      <div className="mb-8">
        <Adsense slot="1234567890" format="horizontal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Kategoriler</h2>
            <nav className="space-y-2">
              {categories.map(category => (
                <Link 
                  key={category.slug}
                  href={`/categories/${category.slug}`} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <span>{category.title}</span>
                  <span className="text-sm text-muted-foreground">{category.count}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Sidebar Ad */}
          <div className="sticky top-4">
            <Adsense slot="9876543210" format="vertical" />
          </div>
        </div>

        {/* Main Content */}
        <main className="lg:col-span-3 space-y-8">
          {/* Recent Topics */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Son Konular</h2>
            <div className="space-y-4">
              {recentTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>

          {/* Content Ad */}
          <div className="my-8">
            <Adsense slot="5432109876" format="rectangle" />
          </div>

          {/* Popular Topics */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Popüler Konular</h2>
            <div className="space-y-4">
              {popularTopics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}