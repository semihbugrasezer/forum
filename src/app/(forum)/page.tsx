"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageSquare, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForumPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Forum</h1>
        <Button asChild>
          <Link href="/new-topic">
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Konu
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Popüler Kategoriler */}
        <div className="col-span-full mb-8">
          <h2 className="text-xl font-semibold mb-4">Popüler Kategoriler</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {["Miles&Smiles", "Yurt İçi Uçuşlar", "Yurt Dışı Uçuşlar", "Bilet İşlemleri", "Kabin Deneyimi", "THY Mobil Uygulama"].map((category) => (
              <Link 
                key={category} 
                href={`/forum/categories/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>{category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Son Konular */}
        <div className="col-span-full lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Son Konular</h2>
          <div className="space-y-4">
            {[
              { id: 1, title: "Miles&Smiles puan sorgulama", category: "Miles&Smiles", replies: 12, views: 345 },
              { id: 2, title: "Avrupa'ya en uygun fiyatlı biletler", category: "Yurt Dışı Uçuşlar", replies: 7, views: 210 },
              { id: 3, title: "Business Class deneyimi", category: "Kabin Deneyimi", replies: 25, views: 560 },
              { id: 4, title: "Uygulama üzerinden check-in yapamıyorum", category: "THY Mobil Uygulama", replies: 5, views: 120 },
              { id: 5, title: "Bilet değişikliği nasıl yapılır?", category: "Bilet İşlemleri", replies: 18, views: 430 },
            ].map((topic) => (
              <Link 
                key={topic.id} 
                href={`/forum/topic/${topic.id}`}
                className="p-4 bg-card rounded-lg border border-border hover:border-primary flex flex-col gap-2 transition-colors"
              >
                <h3 className="font-medium text-lg">{topic.title}</h3>
                <div className="flex items-center text-sm text-muted-foreground gap-4">
                  <span>Kategori: {topic.category}</span>
                  <span>{topic.replies} yanıt</span>
                  <span>{topic.views} görüntülenme</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" asChild>
              <Link href="/forum/topics">
                Tüm Konuları Gör
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Yan Panel */}
        <div className="col-span-full lg:col-span-1">
          <div className="space-y-6">
            {/* Son Aktif Kullanıcılar */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">Son Aktif Kullanıcılar</h3>
              <ul className="space-y-3">
                {["Ahmet Y.", "Ayşe D.", "Mehmet S.", "Fatma K.", "Mustafa T."].map((user) => (
                  <li key={user} className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      {user[0]}
                    </div>
                    <span>{user}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* İstatistikler */}
            <div className="p-4 bg-card rounded-lg border border-border">
              <h3 className="text-lg font-medium mb-3">Forum İstatistikleri</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Toplam Konu:</span>
                  <span className="font-medium">1,245</span>
                </li>
                <li className="flex justify-between">
                  <span>Toplam Mesaj:</span>
                  <span className="font-medium">8,732</span>
                </li>
                <li className="flex justify-between">
                  <span>Toplam Üye:</span>
                  <span className="font-medium">3,487</span>
                </li>
                <li className="flex justify-between">
                  <span>Son Kayıt Olan Üye:</span>
                  <span className="font-medium">Zeynep A.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 