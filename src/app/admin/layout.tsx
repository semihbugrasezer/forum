"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from '@/utils/supabase/client';
import { User } from "@supabase/supabase-js";
import {
  Users,
  Settings,
  BarChart3,
  ListFilter,
  MessageSquare,
  Flag,
  FileText,
  HomeIcon,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  submenu?: NavSubItem[];
}

interface NavSubItem {
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  {
    title: "Genel Bakış",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
    submenu: [
      { title: "Tüm Kullanıcılar", href: "/admin/users" },
      { title: "Moderatörler", href: "/admin/users/moderators" },
      { title: "Yasaklı Kullanıcılar", href: "/admin/users/banned" },
    ],
  },
  {
    title: "Konular",
    href: "/admin/topics",
    icon: MessageSquare,
    submenu: [
      { title: "Tüm Konular", href: "/admin/topics" },
      { title: "Bekleyen Onaylar", href: "/admin/topics/pending" },
      { title: "Arşiv", href: "/admin/topics/archived" },
    ],
  },
  {
    title: "Kategoriler",
    href: "/admin/categories",
    icon: ListFilter,
  },
  {
    title: "Raporlar",
    href: "/admin/reports",
    icon: Flag,
  },
  {
    title: "İstatistikler",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "İçerik Yönetimi",
    href: "/admin/content",
    icon: FileText,
  },
  {
    title: "Ayarlar",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Admin sayfasına erişim izniniz yok. Lütfen giriş yapın.");
          router.push('/auth/login?redirect=/admin');
          return;
        }
        
        const user = session.user;
        
        // Admin kontrolü - Geliştirme ve prodüksiyon için güvenli
        const isAdmin = () => {
          if (process.env.NEXT_PUBLIC_ADMIN_ACCESS === 'true' && process.env.NODE_ENV === 'development') {
            // If DEVELOPMENT_ADMIN_EMAIL is not set, allow any email in development mode
            if (!process.env.DEVELOPMENT_ADMIN_EMAIL || 
                process.env.DEVELOPMENT_ADMIN_EMAIL === user.email) {
              return true;
            }
          }
          
          return user.email?.endsWith("@thy.com") || 
                 user.app_metadata?.roles?.includes("admin") || 
                 false;
        };
        
        if (!isAdmin()) {
          toast.error("Bu sayfaya erişim izniniz yok.");
          router.push('/');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Admin yetki kontrolü sırasında hata:', error);
        toast.error('Bir hata oluştu.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase, router]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/40">
        {/* Sol Panel - Yükleniyor */}
        <aside className="hidden w-64 flex-col bg-card p-4 shadow-md md:flex">
          <div className="mb-4">
            <Skeleton className="h-8 w-40" />
          </div>
          <Separator className="mb-4" />
          <nav className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Skeleton key={item} className="h-10 w-full" />
            ))}
          </nav>
        </aside>

        {/* Sağ Panel - İçerik */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sol Panel - Mobilde kapalı */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 flex-col bg-card shadow-md transition-transform md:relative md:flex",
        mobileNavOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Mobil Kapat Butonu */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 md:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        
        {/* Admin Panel Başlığı */}
        <div className="flex items-center gap-2 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-white">
            <Settings className="h-5 w-5" />
          </div>
          <span className="font-semibold">THY Admin Panel</span>
        </div>
        
        <Separator className="mb-4" />
        
        {/* Admin Navigasyon */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-2">
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start mb-2"
          >
            <Link href="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
          
          <Separator className="mb-4" />
          
          {navItems.map((item) => (
            <div key={item.title} className="space-y-1">
              {item.submenu ? (
                <>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className="w-full justify-between text-left"
                    onClick={() => toggleSubmenu(item.title)}
                  >
                    <span className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openSubmenus[item.title] ? "rotate-180" : ""
                      )}
                    />
                  </Button>
                  
                  {openSubmenus[item.title] && (
                    <div className="ml-6 space-y-1 pt-1">
                      {item.submenu.map((subitem) => (
                        <Button
                          key={subitem.href}
                          asChild
                          variant={pathname === subitem.href || pathname?.startsWith(subitem.href) ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          size="sm"
                        >
                          <Link href={subitem.href}>{subitem.title}</Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Button
                  asChild
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Sağ Panel - Ana İçerik */}
      <div className="flex-1">
        {/* Üst Bar */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/90 backdrop-blur-sm px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user?.email?.split('@')[0]} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/user-profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Ayarlar</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                    toast.success("Çıkış yapıldı");
                  }}
                  className="text-red-600"
                >
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* İçerik */}
        <main className="p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}