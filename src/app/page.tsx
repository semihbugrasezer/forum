"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  TrendingUp, 
  User as UserIcon, 
  Users, 
  Star, 
  Bookmark, 
  PlaneTakeoff,
  Globe,
  Award,
  Shield,
  ArrowRight
} from 'lucide-react';

// Component to handle search params that needs to be wrapped in Suspense
function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    }
    getUser();

    // Hata kontrolü
    const error = searchParams?.get('error');
    if (error) {
      toast.error(decodeURIComponent(error));
    }
  }, [supabase, searchParams]);

  return { user, loading };
}

export default function HomePage() {
  const router = useRouter();

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    </div>}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const { user, loading } = SearchParamsHandler();
  
  // Forum özellikleri
  const features = [
    {
      title: "Konular ve Tartışmalar",
      description: "THY ile ilgili deneyimlerinizi paylaşın, sorular sorun ve diğer yolcuların deneyimlerinden öğrenin.",
      icon: MessageSquare,
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      title: "Miles&Smiles Topluluğu",
      description: "Mil biriktirme taktikleri, statü avantajları ve özel teklifler hakkında bilgi alışverişi yapın.",
      icon: Star,
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    {
      title: "Seyahat Rehberleri",
      description: "Destinasyonlar, lounge erişimleri ve uçuş deneyimleri hakkında rehberler bulun.",
      icon: Bookmark,
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      title: "THY Çalışan Ağı",
      description: "Meslektaşlarınızla bağlantı kurun, deneyimlerinizi paylaşın ve iş birliği yapın.",
      icon: Users,
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
  ];

  // Hizmetler
  const services = [
    {
      title: "7/24 Destek",
      description: "Topluluğumuz ve moderatörlerimiz sorularınızı yanıtlamaya hazır.",
      icon: Shield,
    },
    {
      title: "Uçuş Bilgilendirmeleri",
      description: "En güncel uçuş bilgileri ve önemli değişiklikler.",
      icon: PlaneTakeoff,
    },
    {
      title: "Destinasyon Rehberleri",
      description: "THY'nin uçtuğu destinasyonlar hakkında detaylı rehberler.",
      icon: Globe,
    },
    {
      title: "Sadakat Programı",
      description: "Miles&Smiles programı hakkında ipuçları ve stratejiler.",
      icon: Award,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300">
            THY Forum'a Hoş Geldiniz
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Türk Hava Yolları yolcuları ve çalışanları için Türkiye'nin en büyük havacılık topluluğu
          </p>
          
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          ) : user ? (
            <div className="mt-10 flex flex-col items-center">
              <div className="mb-4 w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-2xl font-semibold mb-2">Merhaba, {user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <Button asChild size="lg">
                  <Link href="/forum">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Forum'a Git
                  </Link>
                </Button>
                <Button variant="outline" asChild size="lg">
                  <Link href="/user-profile">
                    <UserIcon className="mr-2 h-5 w-5" />
                    Profilim
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">
                  Giriş Yap
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login?tab=register">
                  Kayıt Ol
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Öne Çıkan İstatistikler */}
        <div className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">5,240+</p>
                <p className="text-gray-600 dark:text-gray-300">Üye</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">12,800+</p>
                <p className="text-gray-600 dark:text-gray-300">Konu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">32,150+</p>
                <p className="text-gray-600 dark:text-gray-300">Mesaj</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-background/60 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">250+</p>
                <p className="text-gray-600 dark:text-gray-300">Günlük Aktif</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Forum Özellikleri Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Forum Özellikleri</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            THY Forum'un sunduğu avantajları keşfedin
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow h-full">
                <CardHeader>
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", feature.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Güncel Konular Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-blue-50/50 dark:bg-gray-800/20 rounded-lg">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Güncel Konular</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Topluluğumuzda en çok konuşulan başlıklar
          </p>
        </div>

        <Tabs defaultValue="popular" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="popular" className="px-4">
                <TrendingUp className="h-4 w-4 mr-2" />
                Popüler
              </TabsTrigger>
              <TabsTrigger value="recent" className="px-4">
                <MessageSquare className="h-4 w-4 mr-2" />
                Yeni
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Miles&Smiles Elite Plus Avantajları",
                  category: "Miles&Smiles",
                  comments: 45,
                  color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
                },
                {
                  title: "İstanbul-Tokyo Uçuşu Deneyimim",
                  category: "Uçuş Deneyimleri",
                  comments: 32,
                  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                },
                {
                  title: "Business Class Upgrade İpuçları",
                  category: "İpuçları",
                  comments: 28,
                  color: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                },
              ].map((topic, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <Link 
                      href="/forum" 
                      className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Badge className={cn("mb-3", topic.color)}>
                        {topic.category}
                      </Badge>
                      <h3 className="text-xl font-medium mb-3">{topic.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {topic.comments} yorum
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild>
                <Link href="/forum">
                  Tüm Konuları Görüntüle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "THY Yeni Destinasyonlar 2024",
                  category: "Haberler",
                  comments: 12,
                  color: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
                },
                {
                  title: "Lounge Deneyimi Paylaşımları",
                  category: "Uçuş Deneyimleri",
                  comments: 8,
                  color: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                },
                {
                  title: "Mil Kazanma Stratejileri",
                  category: "Miles&Smiles",
                  comments: 15,
                  color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
                },
              ].map((topic, i) => (
                <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <Link 
                      href="/forum" 
                      className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Badge className={cn("mb-3", topic.color)}>
                        {topic.category}
                      </Badge>
                      <h3 className="text-xl font-medium mb-3">{topic.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {topic.comments} yorum
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button asChild>
                <Link href="/forum">
                  Tüm Konuları Görüntüle
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Servisler Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Servislerimiz</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Deneyimli topluluğumuz ve moderatörlerimiz yardıma hazır
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <div key={i} className="text-center p-6 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Hemen Katılın ve Deneyiminizi Paylaşın</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            THY Forum'a katılarak deneyimlerinizi paylaşabilir, sorularınızı sorabilir ve diğer yolculardan bilgi alabilirsiniz.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {user ? (
              <Button asChild size="lg">
                <Link href="/new-topic">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Yeni Konu Oluştur
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/auth/login">
                  Hemen Katıl
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link href="/forum">
                Tartışmalara Katıl
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
