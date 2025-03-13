"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, User, MessageSquare, Tag, Filter, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Head from "next/head";

interface SearchResult {
  id: number;
  type: "topic" | "user" | "post" | "category";
  title: string;
  content?: string;
  author?: string;
  category?: string;
  date?: string;
  replies?: number;
  views?: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialType = searchParams.get("type") || "all";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState(initialType === "all" ? "topics" : initialType);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Örnek arama sonuçları (gerçek uygulamada API çağrısı yapılacak)
  const mockResults: Record<string, SearchResult[]> = {
    topics: [
      { id: 1, type: "topic", title: "Miles&Smiles puan sorgulama", content: "Puanlarımı nerede görüntüleyebilirim?", author: "Ahmet Y.", category: "Miles&Smiles", date: "2 gün önce", replies: 12, views: 345 },
      { id: 2, type: "topic", title: "Avrupa'ya en uygun fiyatlı biletler", content: "Avrupa destinasyonları için en uygun fiyatlı biletleri bulma taktikleri", author: "Mehmet S.", category: "Yurt Dışı Uçuşlar", date: "5 gün önce", replies: 7, views: 210 },
      { id: 3, type: "topic", title: "Business Class deneyimi", content: "İstanbul-Londra uçuşunda Business Class deneyimim", author: "Fatma K.", category: "Kabin Deneyimi", date: "1 hafta önce", replies: 25, views: 560 },
    ],
    posts: [
      { id: 4, type: "post", title: "Miles&Smiles mobil uygulamada görünmüyor", content: "Uygulamayı güncelledim ama hala Miles&Smiles puanlarımı göremiyorum.", author: "Zeynep A.", category: "Miles&Smiles", date: "3 gün önce" },
      { id: 5, type: "post", title: "İstanbul-Paris seferleri hakkında", content: "İstanbul-Paris seferlerinin saatleri ne zaman değişecek?", author: "Ali B.", category: "Yurt Dışı Uçuşlar", date: "1 hafta önce" },
    ],
    users: [
      { id: 6, type: "user", title: "Ahmet Yılmaz", content: "THY Elite Plus üyesi • 234 konu • 1.2B yorum" },
      { id: 7, type: "user", title: "Mehmet Saygın", content: "THY Elite üyesi • 56 konu • 482 yorum" },
      { id: 8, type: "user", title: "Fatma Kaya", content: "THY Classic üyesi • 12 konu • 87 yorum" },
    ],
    categories: [
      { id: 9, type: "category", title: "Miles&Smiles", content: "THY sadakat programı ile ilgili konular • 345 konu • 2.4B yorum" },
      { id: 10, type: "category", title: "Yurt Dışı Uçuşlar", content: "Yurt dışı uçuşlar hakkında bilgiler • 567 konu • 3.2B yorum" },
      { id: 11, type: "category", title: "Kabin Deneyimi", content: "Uçak içi deneyimler hakkında konular • 278 konu • 1.8B yorum" },
    ]
  };

  // Tüm sonuçları birleştir
  const allResults = [
    ...mockResults.topics,
    ...mockResults.posts,
    ...mockResults.users,
    ...mockResults.categories
  ];

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery]);

  const performSearch = () => {
    setIsLoading(true);
    
    // Arama sonuçlarını filtrele (gerçek uygulamada API çağrısı olacak)
    let filteredResults: SearchResult[] = [];
    
    if (activeTab === "all") {
      filteredResults = allResults.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    } else {
      filteredResults = mockResults[activeTab].filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Simüle edilmiş gecikme
    setTimeout(() => {
      setResults(filteredResults);
      setIsLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // URL'yi güncelle (arama sonuçları için derin bağlantılar)
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeTab !== 'topics') params.set('type', activeTab);
    
    router.push(`/search?${params.toString()}`);
    performSearch();
  };

  return (
    <>
      <Head>
        <title>{searchQuery ? `"${searchQuery}" için arama sonuçları` : 'Arama - THY Forum'}</title>
        <meta 
          name="description" 
          content={searchQuery 
            ? `THY Forum içerisinde "${searchQuery}" için arama sonuçları. Türk Hava Yolları ve Miles&Smiles hakkında bilgiler.` 
            : 'THY Forum içerisinde konular, yorumlar ve kullanıcılar arasında arama yapın.'}
        />
        <meta name="keywords" content="THY Forum, arama, Turkish Airlines, Miles&Smiles, forum araması" />
        <meta property="og:title" content={searchQuery ? `"${searchQuery}" için arama sonuçları - THY Forum` : 'Arama - THY Forum'} />
        <meta property="og:type" content="website" />
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {searchQuery ? `"${searchQuery}" için arama sonuçları` : "Arama"}
          </h1>
          <p className="text-muted-foreground">
            THY Forum içerisinde konular, yorumlar ve kullanıcılar arasında arama yapın
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sol panel - Arama Formu ve Filtreler */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Arama</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Arama yapın..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Türü</label>
                    <Select 
                      value={activeTab} 
                      onValueChange={setActiveTab}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Arama türü" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="topics">Konular</SelectItem>
                        <SelectItem value="posts">İletiler</SelectItem>
                        <SelectItem value="users">Kullanıcılar</SelectItem>
                        <SelectItem value="categories">Kategoriler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kategori</label>
                    <Select defaultValue="all">
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        <SelectItem value="milessmiles">Miles&Smiles</SelectItem>
                        <SelectItem value="international">Yurt Dışı Uçuşlar</SelectItem>
                        <SelectItem value="domestic">Yurt İçi Uçuşlar</SelectItem>
                        <SelectItem value="cabin">Kabin Deneyimi</SelectItem>
                        <SelectItem value="app">THY Mobil Uygulama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tarih</label>
                    <Select defaultValue="anytime">
                      <SelectTrigger>
                        <SelectValue placeholder="Tarih seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anytime">Herhangi bir zaman</SelectItem>
                        <SelectItem value="today">Bugün</SelectItem>
                        <SelectItem value="week">Bu hafta</SelectItem>
                        <SelectItem value="month">Bu ay</SelectItem>
                        <SelectItem value="year">Bu yıl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Search className="mr-2 h-4 w-4" />
                    Ara
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {searchQuery && (
              <Card>
                <CardHeader>
                  <CardTitle>Popüler Aramalar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/search?q=miles+smiles+puan" className="flex items-center text-sm hover:underline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Miles&Smiles puan
                      </Link>
                    </li>
                    <li>
                      <Link href="/search?q=business+class" className="flex items-center text-sm hover:underline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Business Class
                      </Link>
                    </li>
                    <li>
                      <Link href="/search?q=bagaj+hakları" className="flex items-center text-sm hover:underline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Bagaj hakları
                      </Link>
                    </li>
                    <li>
                      <Link href="/search?q=economy+premium" className="flex items-center text-sm hover:underline">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Economy Premium
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sağ Panel - Arama Sonuçları */}
          <div className="lg:col-span-3">
            {!searchQuery ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-medium mb-2">Arama yapmak için yukarıdaki formu kullanın</h2>
                <p className="text-muted-foreground mb-4">
                  Konular, mesajlar, kullanıcılar ve kategoriler arasında arama yapabilirsiniz
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline" className="text-sm px-3 py-1">Miles&Smiles</Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">Business Class</Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">Yurt Dışı Uçuşlar</Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">Check-in</Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">Bagaj Hakkı</Badge>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Arama sonuçları yükleniyor...</p>
                </div>
              </div>
            ) : (
              <>
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-4">
                    <TabsList>
                      <TabsTrigger value="all">
                        Tümü ({allResults.length})
                      </TabsTrigger>
                      <TabsTrigger value="topics">
                        Konular ({mockResults.topics.length})
                      </TabsTrigger>
                      <TabsTrigger value="posts">
                        İletiler ({mockResults.posts.length})
                      </TabsTrigger>
                      <TabsTrigger value="users">
                        Kullanıcılar ({mockResults.users.length})
                      </TabsTrigger>
                      <TabsTrigger value="categories">
                        Kategoriler ({mockResults.categories.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <Select defaultValue="relevant">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sıralama" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevant">İlgili</SelectItem>
                        <SelectItem value="newest">En Yeni</SelectItem>
                        <SelectItem value="oldest">En Eski</SelectItem>
                        <SelectItem value="popular">En Popüler</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                
                  <TabsContent value="all" className="space-y-4">
                    {results.length > 0 ? (
                      results.map((result) => (
                        <Card key={`${result.type}-${result.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-2">
                              <div className="mt-1">
                                {result.type === "topic" && <MessageSquare className="h-5 w-5 text-primary" />}
                                {result.type === "post" && <MessageSquare className="h-5 w-5 text-secondary" />}
                                {result.type === "user" && <User className="h-5 w-5 text-primary" />}
                                {result.type === "category" && <Tag className="h-5 w-5 text-primary" />}
                              </div>
                              <div className="flex-1">
                                <Link
                                  href={`/forum/${result.type === "topic" ? "topic" : result.type === "user" ? "user" : result.type === "category" ? "categories" : "post"}/${result.id}`}
                                  className="text-lg font-medium hover:underline"
                                >
                                  {result.title}
                                </Link>
                                {result.content && (
                                  <p className="text-sm text-muted-foreground mt-1">{result.content}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
                                  {result.type !== "user" && result.author && (
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {result.author}
                                    </span>
                                  )}
                                  {result.category && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline">{result.category}</Badge>
                                    </>
                                  )}
                                  {result.date && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {result.date}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-lg font-medium mb-2">Sonuç bulunamadı</p>
                        <p className="text-muted-foreground">Lütfen farklı anahtar kelimelerle tekrar deneyin</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="topics" className="space-y-4">
                    {activeTab === "topics" && mockResults.topics.map((result) => (
                      <Card key={result.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              <MessageSquare className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Link
                                href={`/forum/topic/${result.id}`}
                                className="text-lg font-medium hover:underline"
                              >
                                {result.title}
                              </Link>
                              <p className="text-sm text-muted-foreground mt-1">{result.content}</p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {result.author}
                                </span>
                                <span>•</span>
                                <Badge variant="outline">{result.category}</Badge>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {result.date}
                                </span>
                                <span>•</span>
                                <span>{result.replies} yanıt</span>
                                <span>•</span>
                                <span>{result.views} görüntüleme</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  
                  {/* Diğer sekmelerin içerikleri benzer şekilde oluşturulabilir */}
                  <TabsContent value="posts" className="space-y-4">
                    {/* Post tipindeki sonuçlar */}
                  </TabsContent>
                  
                  <TabsContent value="users" className="space-y-4">
                    {/* Kullanıcı tipindeki sonuçlar */}
                  </TabsContent>
                  
                  <TabsContent value="categories" className="space-y-4">
                    {/* Kategori tipindeki sonuçlar */}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 