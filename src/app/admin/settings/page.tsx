"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";

// Metadata should only be in the separate metadata.ts file, not in a client component

export default function SettingsPage() {
  const form = useForm({
    defaultValues: {
      forumName: "THY Forum",
      forumDescription: "Turkish Airlines Forum Community",
      language: "tr",
      topicsPerPage: "20",
      commentsPerPage: "50",
      darkMode: false,
      colorScheme: "default",
      emailNotifications: false,
      pushNotifications: false,
      registrationApproval: false,
      captcha: false,
      maintenanceMode: false,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ayarlar</h2>
        <p className="text-muted-foreground">
          Forum ayarlarını yönetin ve özelleştirin
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Genel</TabsTrigger>
          <TabsTrigger value="appearance">Görünüm</TabsTrigger>
          <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
          <TabsTrigger value="security">Güvenlik</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forum Bilgileri</CardTitle>
              <CardDescription>
                Forum hakkında temel bilgileri düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem>
                <FormLabel>Forum Adı</FormLabel>
                <FormControl>
                  <Input defaultValue="THY Forum" />
                </FormControl>
                <FormDescription>
                  Forumun görünen adı
                </FormDescription>
              </FormItem>
              <FormItem>
                <FormLabel>Forum Açıklaması</FormLabel>
                <FormControl>
                  <Textarea
                    defaultValue="Turkish Airlines Forum Community"
                  />
                </FormControl>
                <FormDescription>
                  SEO ve meta açıklamalarda kullanılacak açıklama
                </FormDescription>
              </FormItem>
              <FormItem>
                <FormLabel>Varsayılan Dil</FormLabel>
                <Select defaultValue="tr">
                  <SelectTrigger>
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Forumun varsayılan dili
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>İçerik Ayarları</CardTitle>
              <CardDescription>
                İçerik yönetimi ile ilgili ayarları düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem>
                <FormLabel>Sayfa Başına Konu</FormLabel>
                <FormControl>
                  <Input type="number" defaultValue="20" />
                </FormControl>
                <FormDescription>
                  Bir sayfada gösterilecek konu sayısı
                </FormDescription>
              </FormItem>
              <FormItem>
                <FormLabel>Sayfa Başına Yorum</FormLabel>
                <FormControl>
                  <Input type="number" defaultValue="50" />
                </FormControl>
                <FormDescription>
                  Bir sayfada gösterilecek yorum sayısı
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tema Ayarları</CardTitle>
              <CardDescription>
                Forum görünümünü özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Karanlık Mod
                  </FormLabel>
                  <FormDescription>
                    Varsayılan tema modunu ayarlayın
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Renk Şeması</FormLabel>
                <Select defaultValue="default">
                  <SelectTrigger>
                    <SelectValue placeholder="Renk şeması seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Varsayılan</SelectItem>
                    <SelectItem value="blue">Mavi</SelectItem>
                    <SelectItem value="red">Kırmızı</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Forum renk şemasını seçin
                </FormDescription>
              </FormItem>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                E-posta ve sistem bildirimlerini yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    E-posta Bildirimleri
                  </FormLabel>
                  <FormDescription>
                    Yeni konular ve yorumlar için e-posta bildirimleri
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Push Bildirimleri
                  </FormLabel>
                  <FormDescription>
                    Tarayıcı push bildirimleri
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>
                Forum güvenlik ayarlarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Kayıt Onayı
                  </FormLabel>
                  <FormDescription>
                    Yeni üyelikler için yönetici onayı gerekir
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    CAPTCHA
                  </FormLabel>
                  <FormDescription>
                    Form gönderimlerinde CAPTCHA doğrulaması
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Bakım Modu
                  </FormLabel>
                  <FormDescription>
                    Forum bakım modunu etkinleştir
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch />
                </FormControl>
              </FormItem>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="flex justify-end">
        <Button>Değişiklikleri Kaydet</Button>
      </div>
    </div>
  );
} 