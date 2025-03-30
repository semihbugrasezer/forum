import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function TopicNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">Konu Bulunamadı</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-6">
          Aradığınız konu bulunamadı. Konu silinmiş veya hiç oluşturulmamış olabilir.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Henüz forum konuları oluşturulmadıysa, <Link href="/admin/seed" className="text-primary hover:underline">örnek konular ekleyebilirsiniz</Link>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/topics">
              Tüm Konulara Dön
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 