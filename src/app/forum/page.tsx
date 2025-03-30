"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, PlusCircle, Star, Clock, TrendingUp, Filter, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClientComponentClient } from '@/utils/supabase/client';
import { User as SupabaseUser } from "@supabase/supabase-js";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState("popular");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getUser();
  }, [supabase]);

  // Örnek veri - gerçek projede API'den çekilir
  const topics = [
    { id: 1, title: "Miles&Smiles puan sorgulama", author: "Ahmet Y.", category: "Miles&Smiles", replies: 12, views: 345, date: "3 gün önce", isHot: true },
    { id: 2, title: "Avrupa'ya en uygun fiyatlı biletler", author: "Mehmet S.", category: "Yurt Dışı Uçuşlar", replies: 7, views: 210, date: "5 gün önce", isHot: false },
    { id: 3, title: "Business Class deneyimi", author: "Fatma K.", category: "Kabin Deneyimi", replies: 25, views: 560, date: "1 hafta önce", isHot: true },
    { id: 4, title: "Uygulama üzerinden check-in yapamıyorum", author: "Zeynep A.", category: "THY Mobil Uygulama", replies: 5, views: 120, date: "2 hafta önce", isHot: false },
    { id: 5, title: "Bilet değişikliği nasıl yapılır?", author: "Ali B.", category: "Bilet İşlemleri", replies: 18, views: 430, date: "3 hafta önce", isHot: false },
    { id: 6, title: "İstanbul Havalimanı'nda uygun yiyecek önerileri", author: "Merve D.", category: "Seyahat İpuçları", replies: 32, views: 780, date: "1 ay önce", isHot: true },
  ];

  // Kategoriler
  const categories = [
    { id: 1, name: "Miles&Smiles", count: 145 },
    { id: 2, name: "Yurt İçi Uçuşlar", count: 87 },
    { id: 3, name: "Yurt Dışı Uçuşlar", count: 124 },
    { id: 4, name: "Bilet İşlemleri", count: 76 },
    { id: 5, name: "Kabin Deneyimi", count: 98 },
    { id: 6, name: "THY Mobil Uygulama", count: 54 },
    { id: 7, name: "Seyahat İpuçları", count: 110 },
    { id: 8, name: "Bagaj İşlemleri", count: 65 },
  ];

  return (
    <>
      <Head>
        <title>THY Forum - Türk Hava Yolları Yolcu Topluluğu</title>
        <meta name="description" content="THY Forum'da seyahat deneyimlerinizi paylaşın, Miles&Smiles programı hakkında bilgi edinin, diğer yolcularla iletişime geçin." />
        <meta name="keywords" content="THY forum, Turkish Airlines, Miles&Smiles, uçuş deneyimi, seyahat topluluğu" />
        <meta property="og:title" content="THY Forum - Türk Hava Yolları Yolcu Topluluğu" />
        <meta property="og:description" content="THY Forum'da seyahat deneyimlerinizi paylaşın, Miles&Smiles programı hakkında bilgi edinin, diğer yolcularla iletişime geçin." />
        <meta property="og:type" content="website" />
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        {/* Üst bölüm - Başlık ve butonlar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">THY Forum</h1>
            <p className="text-muted-foreground mt-1">Türk Hava Yolları yolcu topluluğuna hoş geldiniz</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/forum/categories">
                <Filter className="mr-2 h-4 w-4" />
                Kategoriler
              </Link>
            </Button>
            <Button asChild>
              <Link href="/new-topic">
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Konu
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Ana içerik grid yapısı */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol panel - Kategoriler ve bilgiler */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="space-y-6">
              {/* Arama Kutusu */}
              <div className="relative">
                <Input 
                  type="search" 
                  placeholder="Forum'da ara..." 
                  className="pl-10"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      router.push(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.querySelector('input[type="search"]') as HTMLInputElement;
                    if (input && input.value.trim()) {
                      router.push(`/search?q=${encodeURIComponent(input.value.trim())}`);
                    }
                  }}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  aria-label="Ara"
                >
                  <Search className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              </div>
              
              {/* Kategoriler */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Kategoriler</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1">
                  {categories.map((category) => (
                    <Link 
                      key={category.id} 
                      href={`/forum/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center justify-between py-2 hover:underline"
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </Link>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/forum/categories">Tüm Kategorileri Gör</Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Forum İstatistikleri */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Forum İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Toplam Konu:</span>
                      <span className="font-medium">1,245</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Toplam Mesaj:</span>
                      <span className="font-medium">8,732</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Toplam Üye:</span>
                      <span className="font-medium">3,487</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Son Üye:</span>
                      <span className="font-medium">Zeynep A.</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Aktif Kullanıcılar */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Aktif Kullanıcılar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {["Ahmet Y.", "Ayşe D.", "Mehmet S.", "Fatma K.", "Mustafa T."].map((user, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          {user[0]}
                        </div>
                        <span>{user}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Sağ Panel - Konular */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex items-center gap-2">
                    <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList>
                        <TabsTrigger value="popular">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Popüler
                        </TabsTrigger>
                        <TabsTrigger value="recent">
                          <Clock className="mr-2 h-4 w-4" />
                          Yeni
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtreleme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Konular</SelectItem>
                        <SelectItem value="hot">Popüler Konular</SelectItem>
                        <SelectItem value="unanswered">Cevaplanmamış</SelectItem>
                        <SelectItem value="solved">Çözülmüş</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {topics.map((topic) => (
                    <div key={topic.id} className="rounded-lg border p-4 transition-colors hover:bg-accent/50">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <Link href={`/forum/topic/${topic.id}`} className="font-medium text-lg hover:underline">
                            {topic.title}
                            {topic.isHot && (
                              <Badge variant="destructive" className="ml-2">
                                <Star className="h-3 w-3 mr-1" /> Popüler
                              </Badge>
                            )}
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground">
                            <span>
                              <User className="inline h-3 w-3 mr-1" />
                              {topic.author}
                            </span>
                            <span>•</span>
                            <Badge variant="outline">{topic.category}</Badge>
                            <span>•</span>
                            <span>{topic.date}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{topic.replies}</span>
                          </div>
                          <div>
                            <span>{topic.views} görüntüleme</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" disabled>
                  Önceki
                </Button>
                <div className="text-sm text-muted-foreground">
                  Sayfa 1 / 10
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/forum/page/2">Sonraki</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
} 