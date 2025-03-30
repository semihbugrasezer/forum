'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { seedTopics } from '@/lib/actions/seed';

export default function SeedPage() {
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await seedTopics(adminEmail);
      
      if (response.error) {
        setError(response.error);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError('Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error('Seed error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Örnek Veri Ekle</CardTitle>
          <CardDescription>
            Bu sayfa, veritabanına örnek forum konuları eklemek için kullanılır. Sadece THY çalışanları bu işlemi gerçekleştirebilir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="adminEmail" className="block text-sm font-medium">
                E-posta Adresi (thy.com uzantılı)
              </label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="ornek@thy.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Hata</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? "Başarılı" : "Hata"}</AlertTitle>
                <AlertDescription>
                  {result.message}
                  {result.count && <div className="mt-2">Eklenen konu sayısı: {result.count}</div>}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSeed} 
            disabled={isLoading || !adminEmail.includes('@')}
          >
            {isLoading ? "İşleniyor..." : "Örnek Konuları Ekle"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 