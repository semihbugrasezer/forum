'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderPlus, Database } from 'lucide-react';

export default function NoTopicsFound() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Henüz Konu Bulunmuyor</CardTitle>
        <CardDescription>
          Veritabanında forum konusu bulunmamaktadır.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <div className="flex justify-center mb-6">
          <Database className="h-16 w-16 text-muted-foreground" />
        </div>
        <p className="mb-4 text-muted-foreground">
          İlk konuyu oluşturarak tartışma başlatabilir veya örnek veri ekleyebilirsiniz.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/topics/new" className="flex items-center">
            <FolderPlus className="mr-2 h-4 w-4" />
            Yeni Konu Oluştur
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/seed" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Örnek Veriler Ekle
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
} 