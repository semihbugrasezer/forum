"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClientComponentClient } from '@/utils/supabase/client';
import { Activity, Users, MessageSquare, Flag, BarChart3 } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Son aktivite listesi (dummy veri)
const recentActivities = [
  {
    user: "mehmet_yilmaz",
    action: "Konu oluşturdu",
    topic: "THY yeni rota",
    time: new Date(Date.now() - 5 * 60000), // 5 dakika önce
  },
  {
    user: "ayse_demir",
    action: "Yorum yaptı",
    topic: "İstanbul-Londra uçuşu",
    time: new Date(Date.now() - 15 * 60000), // 15 dakika önce
  },
  {
    user: "ayse_kaya",
    action: "Rapor edildi",
    topic: "Bagaj problemi",
    time: new Date(Date.now() - 30 * 60000), // 30 dakika önce
  },
  {
    user: "can_ozturk",
    action: "Konu güncelledi",
    topic: "Business Class deneyimi",
    time: new Date(Date.now() - 60 * 60000), // 1 saat önce
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: "0",
    topics: "0",
    comments: "0",
    reports: "0",
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Gerçek projede bu kısımda veritabanından istatistikleri çekebilirsiniz
        // Örnek olarak dummy veriler gösteriyoruz
        setTimeout(() => {
          setStats({
            users: "1,245",
            topics: "342",
            comments: "2,584",
            reports: "8",
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("İstatistikler yüklenirken hata:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Paneli</h1>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="analytics">İstatistikler</TabsTrigger>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Toplam Kullanıcı"
              value={stats.users}
              description="Kayıtlı kullanıcı sayısı"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Aktif Konular"
              value={stats.topics}
              description="Toplam konu sayısı"
              icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Toplam Yorum"
              value={stats.comments}
              description="Yorum sayısı"
              icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
              title="Bekleyen Rapor"
              value={stats.reports}
              description="İncelenmesi gereken rapor sayısı"
              icon={<Flag className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Aktivite Grafiği</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="text-center py-10 text-muted-foreground">
                  {loading ? (
                    "Yükleniyor..."
                  ) : (
                    "Aktivite grafiği burada gösterilecek"
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Son Aktiviteler</CardTitle>
                <CardDescription>
                  Son 24 saat içindeki kullanıcı aktiviteleri
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          <span className="font-bold">{activity.user}</span>{" "}
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.topic} • {activity.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ziyaretçi İstatistikleri</CardTitle>
              <CardDescription>
                Son 30 gün içindeki ziyaretçi verileri
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="text-center py-20 text-muted-foreground">
                <BarChart3 className="mx-auto h-8 w-8 opacity-50" />
                <div className="mt-2">İstatistik verileri burada gösterilecek</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapor Edilen İçerikler</CardTitle>
              <CardDescription>
                Kullanıcılar tarafından rapor edilen içerikler
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-20 text-muted-foreground">
                <Flag className="mx-auto h-8 w-8 opacity-50" />
                <div className="mt-2">Rapor edilen içerikler burada gösterilecek</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}