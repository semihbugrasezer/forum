"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Loader2, LogIn, Mail, Github } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Component to handle search params that needs to be wrapped in Suspense
function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirectTo') || '/';
  const tab = searchParams?.get('tab') || 'login';
  
  return { searchParams, redirectTo, tab };
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-10">
        <div className="w-full max-w-md mx-auto">
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const { searchParams, redirectTo, tab } = SearchParamsHandler();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    // URL'deki tab parametresini kontrol et
    if (tab && (tab === 'login' || tab === 'register')) {
      // Tab değerini ayarla
      const element = document.querySelector(`button[value="${tab}"]`);
      if (element) {
        (element as HTMLButtonElement).click();
      }
    }
  }, [tab]);
  
  const validateEmail = () => {
    setEmailError("");
    if (!email) {
      setEmailError("E-posta adresinizi girmelisiniz");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Geçerli bir e-posta adresi girmelisiniz");
      return false;
    }
    return true;
  };
  
  const validatePassword = () => {
    setPasswordError("");
    if (!password) {
      setPasswordError("Şifrenizi girmelisiniz");
      return false;
    } else if (password.length < 6) {
      setPasswordError("Şifreniz en az 6 karakter olmalıdır");
      return false;
    }
    return true;
  };
  
  const handleSignIn = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes("Invalid login")) {
          toast.error("Geçersiz kullanıcı adı veya şifre");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("E-posta adresiniz henüz doğrulanmamış. Lütfen e-postanızı kontrol edin.");
        } else {
          toast.error(`Giriş yapılamadı: ${error.message}`);
        }
        console.error("Sign in error:", error);
        return;
      }
      
      toast.success("Başarıyla giriş yapıldı");
      
      // Allow state to update before redirect
      setTimeout(() => {
        window.location.href = redirectTo || '/';
      }, 500);
    } catch (error: any) {
      toast.error("Giriş yaparken bir hata oluştu");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async () => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(
        "Kayıt işleminiz başarıyla tamamlandı. Lütfen e-posta adresinize gönderilen doğrulama linkine tıklayın."
      );
    } catch (error: any) {
      if (error.message.includes("already")) {
        toast.error("Bu e-posta adresi zaten kullanılıyor");
      } else {
        toast.error("Kayıt olurken bir hata oluştu");
      }
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailSignIn = async () => {
    if (!validateEmail()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(
        "Giriş için e-posta adresinize bir bağlantı gönderdik. Lütfen e-postanızı kontrol edin."
      );
    } catch (error: any) {
      toast.error("E-posta gönderilirken bir hata oluştu");
      console.error("Email sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Google ile giriş yap
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
          queryParams: { 
            access_type: 'offline',
            prompt: 'consent' 
          },
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error("Google ile giriş yaparken bir hata oluştu");
      console.error("Google sign in error:", error);
      setIsGoogleLoading(false);
    }
  };

  // Github ile giriş yap
  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast.error("Github ile giriş yaparken bir hata oluştu");
      console.error("Github sign in error:", error);
      setIsGithubLoading(false);
    }
  };
  
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-10">
      <div className="w-full max-w-md mx-auto">
        <Tabs defaultValue={tab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register">Kayıt Ol</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Giriş Yap</CardTitle>
                <CardDescription>
                  THY Forum'a hoş geldiniz. Hesabınıza giriş yapın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sosyal medya butonları */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGithubSignIn}
                    disabled={isGithubLoading}
                  >
                    {isGithubLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    Github
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Veya E-posta ile giriş yapın
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                    disabled={isLoading}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Şifre</Label>
                    <Link
                      href="/auth/reset-password"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Şifremi Unuttum
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    disabled={isLoading}
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleSignIn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Giriş Yap
                    </>
                  )}
                </Button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Veya
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleEmailSignIn}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  E-posta ile Bağlantı Gönder
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Hesabınız yok mu?{" "}
                  <Link
                    href="/auth/login?tab=register"
                    className="text-blue-600 hover:underline"
                  >
                    Kayıt Ol
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Kayıt Ol</CardTitle>
                <CardDescription>
                  THY Forum'a üye olarak deneyimlerinizi paylaşın ve topluluğa katılın.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sosyal medya ile kayıt */}
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    )}
                    Google
                  </Button>
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full" 
                    onClick={handleGithubSignIn}
                    disabled={isGithubLoading}
                  >
                    {isGithubLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Github className="mr-2 h-4 w-4" />
                    )}
                    Github
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Veya e-posta ile kayıt olun
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">E-posta</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                    disabled={isLoading}
                  />
                  {emailError && (
                    <p className="text-sm text-red-500">{emailError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Şifre</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={validatePassword}
                    disabled={isLoading}
                  />
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Şifreniz en az 6 karakter uzunluğunda olmalıdır.
                  </p>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kayıt Olunuyor...
                    </>
                  ) : (
                    "Kayıt Ol"
                  )}
                </Button>
              </CardContent>
              <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                  Kayıt olarak{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    kullanım koşullarını
                  </Link>{" "}
                  ve{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    gizlilik politikasını
                  </Link>{" "}
                  kabul etmiş olursunuz.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 