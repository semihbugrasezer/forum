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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            aria-label="Kullanım koşullarını kabul et"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-normal">
                            <Link href="/terms" className="underline">Kullanım Koşulları</Link> ve{" "}
                            <Link href="/privacy" className="underline">Gizlilik Politikası</Link>'nı 
                            kabul ediyorum
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
                Google ile devam et
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 14222 14222">
                  <circle cx="7111" cy="7112" r="7111" fill="#1977f3"/>
                  <path d="M9879 7112l-2768 0 0 -2567 0c0 0 310 -1560 1699 -1560 1620 0 1384 1626 1384 1626l2393 0c-270 -3963 -3919 -3634 -3919 -3634 -4947 0 -4830 5130 -4830 5130l0 1005 -1358 0 0 2493 1358 0 0 5777 2271 0 0 -5777 2768 0 0 0z" fill="#fff"/>
                </svg>
                Facebook ile devam et
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Github className="h-5 w-5" />
                GitHub ile devam et
              </Button>
              
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <Twitter className="h-5 w-5" />
                Twitter ile devam et
              </Button>
            </TabsContent>
          </Tabs>
          
          <Separator />
          
          <div className="text-center text-sm">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/auth/login" className="font-semibold text-primary hover:underline">
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 