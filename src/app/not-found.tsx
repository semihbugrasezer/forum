"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Eski forum URL'lerini yeni yapıya yönlendir
    if (pathname === "/(forum)" || pathname?.startsWith("/(forum)/")) {
      const newPath = pathname.replace(/^\/(forum)/, '/forum');
      router.replace(newPath);
    }
  }, [pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container max-w-2xl py-12 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="h-12 w-12" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Sayfa Bulunamadı</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. Eğer eski bir URL kullanıyorsanız, yeni URL yapısına yönlendirileceksiniz.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">Ana Sayfaya Dön</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/forum">Forum'a Git</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 