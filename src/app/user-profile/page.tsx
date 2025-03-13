"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  MessageSquare, 
  Star, 
  Edit, 
  UserCircle,
  CalendarDays,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from 'sonner';

export default function UserProfilePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Kullanıcı profil bilgileri
  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    memberSince: "",
    location: "İstanbul, Türkiye",
    bio: "THY Elite Plus üyesi. Sık seyahat eden bir gezgin.",
    topics: 23,
    replies: 127,
    badge: "Elite Plus",
    interests: ["Uçuş Deneyimleri", "Miles&Smiles", "Yurt Dışı Seyahat", "Kabin Deneyimi"],
  });

  // Kullanıcının son konuları
  const userTopics = [
    { id: 1, title: "İstanbul-New York business class deneyimim", comments: 18, date: "3 gün önce", category: "Kabin Deneyimi" },
    { id: 2, title: "Miles&Smiles puanlarını kullanmanın en iyi yolu", comments: 32, date: "1 hafta önce", category: "Miles&Smiles" },
    { id: 3, title: "Bağlantılı uçuşlarda bagaj aktarımında yaşanan sorunlar", comments: 8, date: "2 hafta önce", category: "Bagaj İşlemleri" },
    { id: 4, title: "THY mobil uygulamasında check-in yapamıyorum", comments: 5, date: "1 ay önce", category: "Teknik Sorunlar" },
  ];

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/auth/login?redirect=/user-profile');
          return;
        }
        
        setUser(session.user);
        
        // Profil verilerini güncelle
        if (session.user) {
          setProfile({
            ...profile,
            fullName: session.user.user_metadata?.full_name || "THY Kullanıcısı",
            username: session.user.email?.split('@')[0] || "thyuser",
            memberSince: new Date(session.user.created_at).toLocaleDateString('tr-TR')
          });
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        toast.error('Profil bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase, router, profile]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Sol Panel - Kullanıcı Bilgileri */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="relative pt-6">
              <div className="absolute right-4 top-4">
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={profile.fullName} />
                  <AvatarFallback className="text-2xl">{profile.fullName[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <CardTitle className="text-xl">{profile.fullName}</CardTitle>
                  <CardDescription>@{profile.username}</CardDescription>
                </div>
                <Badge className="mt-2" variant="secondary">{profile.badge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                Üyelik: {profile.memberSince}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                {profile.location}
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-medium">Hakkında</h4>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-medium">İstatistikler</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border p-2 text-center">
                    <div className="text-lg font-medium">{profile.topics}</div>
                    <div className="text-xs text-muted-foreground">Konu</div>
                  </div>
                  <div className="rounded-lg border p-2 text-center">
                    <div className="text-lg font-medium">{profile.replies}</div>
                    <div className="text-xs text-muted-foreground">Yanıt</div>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-medium">İlgi Alanları</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Badge key={interest} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Profili Düzenle
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sağ Panel - Ana İçerik */}
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="overview" className="flex items-center">
                <UserCircle className="mr-2 h-4 w-4" />
                Genel Bakış
              </TabsTrigger>
              <TabsTrigger value="topics" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Konularım
              </TabsTrigger>
              <TabsTrigger value="miles" className="flex items-center">
                <Star className="mr-2 h-4 w-4" />
                Miles&Smiles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hoş Geldiniz, {profile.fullName}!</CardTitle>
                  <CardDescription>
                    THY Forum'daki kişisel alanınıza hoş geldiniz. Konularınızı, yanıtlarınızı ve Miles&Smiles bilgilerinizi buradan takip edebilirsiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Son Aktiviteleriniz</h3>
                      <div className="space-y-4">
                        {userTopics.slice(0, 2).map((topic) => (
                          <div key={topic.id} className="rounded-lg border p-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">{topic.title}</h4>
                              <span className="text-sm text-muted-foreground">{topic.date}</span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-muted-foreground">
                              <span>Kategori: {topic.category}</span>
                              <span className="mx-2">•</span>
                              <span>{topic.comments} yorum</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Miles&Smiles Özeti</h3>
                      <div className="rounded-lg border p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Toplam Mil</p>
                            <p className="text-2xl font-bold">42,500</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Statü</p>
                            <p className="text-lg font-medium">{profile.badge}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Son Kullanma</p>
                            <p className="text-lg font-medium">24.05.2025</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Konularım</CardTitle>
                  <CardDescription>
                    Forum'da açtığınız tüm konular burada listelenir.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userTopics.map((topic) => (
                      <div key={topic.id} className="rounded-lg border p-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{topic.title}</h4>
                          <span className="text-sm text-muted-foreground">{topic.date}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <span>Kategori: {topic.category}</span>
                          <span className="mx-2">•</span>
                          <span>{topic.comments} yorum</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Yeni Konu Oluştur
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="miles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Miles&Smiles</CardTitle>
                  <CardDescription>
                    Mil durumunuz ve kullanım geçmişiniz.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Toplam Mil</div>
                        <div className="text-2xl font-bold">42,500</div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Statü Mili</div>
                        <div className="text-2xl font-bold">28,750</div>
                      </div>
                      <div className="rounded-lg border p-4 text-center">
                        <div className="text-sm text-muted-foreground mb-1">Son Kullanma</div>
                        <div className="text-xl font-medium">24.05.2025</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Mil Geçmişi</h3>
                      <div className="space-y-2">
                        {[
                          { id: 1, activity: "İstanbul-New York Uçuşu", miles: "+3,250", date: "15.02.2023" },
                          { id: 2, activity: "Mil Alışverişi (Miles&Smiles Kart)", miles: "+1,500", date: "21.01.2023" },
                          { id: 3, activity: "Upgrade - Business Class", miles: "-15,000", date: "05.01.2023" },
                          { id: 4, activity: "İstanbul-Londra Uçuşu", miles: "+1,250", date: "28.12.2022" },
                        ].map((item) => (
                          <div key={item.id} className="rounded-lg border p-3 flex justify-between items-center">
                            <div>
                              <p className="font-medium">{item.activity}</p>
                              <p className="text-xs text-muted-foreground">{item.date}</p>
                            </div>
                            <div className={`font-bold ${item.miles.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                              {item.miles}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button variant="outline">Mil Kullan</Button>
                  <Button variant="outline">Mil Yükle</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 