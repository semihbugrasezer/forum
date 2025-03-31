"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { 
  Home, 
  PlusCircle, 
  MessageSquare, 
  Bell, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  UserCircle, 
  Sun,
  Moon,
  Star
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase/client";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const mainNavItems: NavItem[] = [
  {
    title: "Ana Sayfa",
    href: "/",
    icon: Home,
  },
  {
    title: "Forum",
    href: "/forum",
    icon: MessageSquare,
  },
  {
    title: "Arama",
    href: "/search",
    icon: Search,
  },
  {
    title: "Yeni Konu",
    href: "/new-topic",
    icon: PlusCircle,
    requireAuth: true,
  },
];

const userNavItems: NavItem[] = [
  {
    title: "Profilim",
    href: "/user-profile",
    icon: UserCircle,
    requireAuth: true,
  },
  {
    title: "Bildirimler",
    href: "/forum/notifications",
    icon: Bell,
    requireAuth: true,
  },
  {
    title: "Miles&Smiles",
    href: "/forum/miles-and-smiles",
    icon: Star,
    requireAuth: true,
  },
  {
    title: "Admin Panel",
    href: "/admin",
    icon: UserCircle,
    requireAuth: true,
    adminOnly: true,
  },
];

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Örnek değer
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  // Add CSS for mobile notch area
  useEffect(() => {
    // Add a style to change the notch color to blue on mobile
    const style = document.createElement('style');
    style.innerHTML = `
      @supports (padding-top: env(safe-area-inset-top)) {
        :root {
          --sat: env(safe-area-inset-top);
          --sar: env(safe-area-inset-right);
          --sab: env(safe-area-inset-bottom);
          --sal: env(safe-area-inset-left);
        }
        body {
          padding-top: var(--sat);
          padding-right: var(--sar);
          padding-bottom: var(--sab);
          padding-left: var(--sal);
        }
        /* Change notch background color from red to blue */
        @media only screen and (display-mode: standalone) {
          html {
            background-color: #2563eb; /* blue-600 */
          }
          body {
            background-color: var(--background);
          }
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session?.user ? "Logged in" : "No session");
        
        setUser(session?.user || null);
        setLoading(false);

        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            // Log auth state changes but ignore initial session check
            if (event !== 'INITIAL_SESSION') {
              console.log("Auth state change:", event, newSession?.user?.id);
            }
            
            setUser(newSession?.user || null);
            
            // On sign in, show welcome notification
            if (event === 'SIGNED_IN') {
              toast.success(`Hoş geldiniz, ${newSession?.user?.user_metadata?.name || newSession?.user?.email?.split('@')[0]}`);
            }
          }
        );

        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await supabase.auth.signOut();
      
      // Clear user state
      setUser(null);
      
      // Optional: Clear any session data from localStorage
      localStorage.removeItem('supabase.auth.token');
      
      toast.success("Başarıyla çıkış yapıldı.");
      
      // Optional: Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Çıkış yaparken bir hata oluştu.");
    }
  };

  const handleSignIn = () => {
    setIsMenuOpen(false);
  };

  const isAdmin = user?.email?.endsWith("@thy.com") || false; // Örnek admin kontrolü
  
  const filteredUserNavItems = userNavItems.filter(
    (item) => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm dark:bg-background/90 dark:border-border/40">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo ve Başlık */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            {/* Airplane Logo - New transparent version */}
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md text-primary font-bold dark:text-blue-400">
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
            <span className="hidden font-bold text-base sm:inline-block dark:text-white">THY Forum</span>
          </Link>
        </div>

        {/* Masaüstü Navigasyon */}
        <nav className="hidden md:flex items-center gap-5">
          {mainNavItems.map((item) => {
            // Özel işlem: arama butonu için
            if (item.href === "/search") {
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href || pathname?.startsWith(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    const searchTerm = prompt("Aramak istediğiniz kelimeyi girin:");
                    if (searchTerm && searchTerm.trim() !== "") {
                      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
                    }
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            }
            
            // Diğer butonlar için normal işlem
            return (!item.requireAuth || (item.requireAuth && user)) && (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary dark:hover:text-blue-400",
                  pathname === item.href || pathname?.startsWith(item.href)
                    ? "text-foreground dark:text-white"
                    : "text-muted-foreground dark:text-gray-400"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* Kullanıcı Menüsü ve Mobil Menü */}
        <div className="flex items-center gap-2">
          {/* Tema Değiştirici */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                {mounted ? (
                  theme === "light" ? (
                    <Sun className="h-5 w-5" />
                  ) : theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                <span className="sr-only">Tema değiştir</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>Açık Tema</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Koyu Tema</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <span>Sistem Teması</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Kullanıcı bilgileri - giriş yapmışsa */}
          {user ? (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              {/* Bildirim Simgesi */}
              <Link 
                href="/forum/notifications"
                className="relative inline-flex"
              >
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-[10px] font-medium text-white flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Yeni Konu Oluştur Butonu - Masaüstü görünümünde belirgin buton olarak eklendi */}
              <Button asChild variant="default" className="hidden md:flex">
                <Link href="/new-topic">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Konu
                </Link>
              </Button>

              {/* Kullanıcı Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 ring-2 ring-offset-2 ring-offset-background ring-primary/10 dark:ring-blue-500/20">
                      <AvatarImage src={user.user_metadata?.avatar_url || ""} alt="Profil" />
                      <AvatarFallback className="bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400">{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 dark:bg-background/95 dark:backdrop-blur-sm dark:border-border/50" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none dark:text-white">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                      <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="dark:bg-border/50" />
                  {filteredUserNavItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="dark:focus:bg-accent/70">
                      <Link href={item.href} className="cursor-pointer dark:text-gray-200">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                        {item.title === "Bildirimler" && notificationCount > 0 && (
                          <Badge variant="primary" className="ml-auto bg-blue-600 hover:bg-blue-700 scale-75">
                            {notificationCount}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="dark:bg-border/50" />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-accent/70"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış Yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Giriş Yap
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">
                  Kayıt Ol
                </Link>
              </Button>
            </div>
          )}

          {/* Mobil Menü */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menü</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80 dark:bg-background/95 dark:backdrop-blur-md dark:border-border/50">
              <SheetHeader className="mb-4">
                <SheetTitle className="dark:text-white">THY Forum</SheetTitle>
              </SheetHeader>
              
              {/* Mobil Kullanıcı Alanı */}
              {user ? (
                <div className="mb-6 flex items-center space-x-4">
                  <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-background ring-primary/10 dark:ring-blue-500/20">
                    <AvatarImage src={user.user_metadata?.avatar_url || ""} alt="Profil" />
                    <AvatarFallback className="bg-primary/10 dark:bg-blue-500/20 text-primary dark:text-blue-400">{user.email?.[0].toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none dark:text-white">{user.user_metadata?.full_name || user.email?.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="mb-6 flex flex-col gap-2">
                  <SheetClose asChild>
                    <Button asChild className="dark:bg-blue-600/90 dark:hover:bg-blue-700">
                      <Link href="/auth/login" onClick={handleSignIn}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Giriş Yap
                      </Link>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button variant="outline" asChild className="dark:bg-transparent dark:text-gray-200 dark:border-gray-700">
                      <Link href="/auth/register" onClick={handleSignIn}>
                        Kayıt Ol
                      </Link>
                    </Button>
                  </SheetClose>
                </div>
              )}

              {/* Mobil Ana Menü */}
              <div className="space-y-1 py-2">
                <h2 className="px-2 text-lg font-semibold tracking-tight dark:text-white">Ana Menü</h2>
                {mainNavItems.map((item) => 
                  (!item.requireAuth || (item.requireAuth && user)) && (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href || pathname?.startsWith(item.href)
                            ? "bg-accent dark:bg-accent/80 dark:text-white"
                            : "transparent dark:text-gray-200"
                        )}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SheetClose>
                  )
                )}
                
                {/* Mobil için belirgin Yeni Konu Buton */}
                {user && (
                  <SheetClose asChild>
                    <Button asChild className="w-full mt-2 justify-start dark:bg-blue-600/90 dark:hover:bg-blue-700">
                      <Link href="/new-topic">
                        <PlusCircle className="mr-2 h-5 w-5" />
                        Yeni Konu Oluştur
                      </Link>
                    </Button>
                  </SheetClose>
                )}
              </div>

              {/* Mobil Kullanıcı Menüsü */}
              {user && (
                <div className="space-y-1 py-2">
                  <h2 className="px-2 text-lg font-semibold tracking-tight dark:text-white">Kullanıcı Menüsü</h2>
                  {filteredUserNavItems.map((item) => (
                    <SheetClose key={item.href} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === item.href || pathname?.startsWith(item.href)
                            ? "bg-accent dark:bg-accent/80 dark:text-white"
                            : "transparent dark:text-gray-200"
                        )}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                        {item.title === "Bildirimler" && notificationCount > 0 && (
                          <Badge variant="primary" className="ml-auto bg-blue-600 hover:bg-blue-700">
                            {notificationCount}
                          </Badge>
                        )}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              )}

              {/* Tema Ayarları */}
              <div className="space-y-1 py-2">
                <h2 className="px-2 text-lg font-semibold tracking-tight dark:text-white">Tema</h2>
                <div className="px-2 py-3">
                  <div className="relative h-12 w-full overflow-hidden rounded-lg border dark:border-gray-700 bg-background p-1 dark:bg-background/30">
                    <div 
                      className={cn(
                        "absolute top-0 bottom-0 w-1/3 rounded-md transition-all duration-200",
                        theme === "light" ? "left-0 bg-blue-600" : 
                        theme === "dark" ? "left-1/3 bg-blue-600" : 
                        "left-2/3 bg-blue-600"
                      )}
                    />
                    <div className="relative z-10 grid grid-cols-3 gap-1 text-xs font-medium">
                      <button
                        className={cn(
                          "flex h-10 items-center justify-center rounded-md",
                          theme === "light" ? "text-white" : "text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-white"
                        )}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="mr-1 h-4 w-4" />
                        Açık
                      </button>
                      <button
                        className={cn(
                          "flex h-10 items-center justify-center rounded-md",
                          theme === "dark" ? "text-white" : "text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-white"
                        )}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="mr-1 h-4 w-4" />
                        Koyu
                      </button>
                      <button
                        className={cn(
                          "flex h-10 items-center justify-center rounded-md",
                          theme === "system" ? "text-white" : "text-foreground hover:text-primary dark:text-gray-300 dark:hover:text-white"
                        )}
                        onClick={() => setTheme("system")}
                      >
                        Sistem
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Çıkış Yap Butonu */}
              {user && (
                <div className="py-4">
                  <Button 
                    variant="destructive" 
                    className="w-full dark:bg-red-900/80 dark:text-white dark:hover:bg-red-900" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
