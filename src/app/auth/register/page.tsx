"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, User, Github, Twitter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Head from "next/head";

const registerSchema = z.object({
  full_name: z
    .string()
    .min(2, { message: "Ad soyad en az 2 karakter olmalıdır" })
    .max(50, { message: "Ad soyad en fazla 50 karakter olabilir" }),
  email: z
    .string()
    .min(1, { message: "E-posta adresi girilmelidir" })
    .email({ message: "Geçerli bir e-posta adresi giriniz" }),
  password: z
    .string()
    .min(8, { message: "Şifre en az 8 karakter olmalıdır" })
    .max(100, { message: "Şifre çok uzun" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir",
    }),
  confirm_password: z.string(),
  terms: z.boolean().refine((val) => val === true, {
    message: "Kullanım koşullarını kabul etmelisiniz",
  }),
}).refine((data) => data.password === data.confirm_password, {
  message: "Şifreler eşleşmiyor",
  path: ["confirm_password"],
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      terms: false,
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Kayıt olma işlemi başarılı! Lütfen e-posta adresinizi kontrol edin.");
      router.push("/auth/login?registered=true");
    } catch (error: any) {
      toast.error(`Kayıt olma hatası: ${error.message || "Bir hata oluştu"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Hesap Oluştur - THY Forum</title>
        <meta name="description" content="THY Forum'a üye olarak seyahat topluluğumuza katılın. Miles&Smiles avantajlarından yararlanın." />
        <meta name="keywords" content="THY Forum, kayıt ol, üye ol, Turkish Airlines, Miles&Smiles" />
        <meta property="og:title" content="THY Forum - Hesap Oluştur" />
        <meta property="og:description" content="THY Forum'a üye olarak seyahat topluluğumuza katılın. Miles&Smiles avantajlarından yararlanın." />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </Head>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto bg-card rounded-lg shadow-sm border p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            <Link href="/" className="flex items-center mb-6">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md text-primary font-bold mr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-7 w-7 transition-all"
                >
                  <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <span className="font-bold text-xl">THY Forum</span>
            </Link>

            <h1 className="text-2xl font-semibold tracking-tight">
              Hesap Oluştur
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              THY Forum'a üye olarak seyahat topluluğumuza katılın
            </p>
          </div>

          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">E-posta ile</TabsTrigger>
              <TabsTrigger value="social">Sosyal Medya ile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Adınız ve soyadınız" 
                            className="pl-9"
                            {...field}
                            aria-label="Ad Soyad"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="E-posta adresiniz" 
                            type="email" 
                            className="pl-9"
                            {...field}
                            aria-label="E-posta"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Şifreniz" 
                            type={showPassword ? "text" : "password"} 
                            className="pl-9"
                            {...field}
                            aria-label="Şifre"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                              {showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirm_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şifre (Tekrar)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            placeholder="Şifrenizi tekrar girin" 
                            type={showConfirmPassword ? "text" : "password"} 
                            className="pl-9"
                            {...field}
                            aria-label="Şifre Tekrar"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-9 w-9"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="sr-only">
                              {showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                            </span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Kullanım koşullarını kabul ediyorum
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Kayıt olunuyor..." : "Kayıt Ol"}
                </Button>
              </Form>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  <Github className="mr-2 h-4 w-4" />
                  Github ile Kayıt Ol
                </Button>
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter ile Kayıt Ol
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 text-center text-sm">
            Zaten hesabınız var mı?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Giriş yapın
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 