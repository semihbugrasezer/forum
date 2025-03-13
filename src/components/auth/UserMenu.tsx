'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings, PenSquare } from 'lucide-react';

export function UserMenu() {
  const { user, isLoading, signOut } = useAuth();
  
  // Kullanıcı yükleniyor
  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
        <Avatar className="h-8 w-8">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }
  
  // Kullanıcı giriş yapmamış
  if (!user) {
    return (
      <Button asChild variant="default" size="sm">
        <Link href="/login">
          Giriş Yap
        </Link>
      </Button>
    );
  }
  
  // Kullanıcı giriş yapmış
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.name || user.email || ''} />
            <AvatarFallback>{(user.user_metadata?.name?.[0] || user.email?.[0] || 'U').toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.user_metadata?.name && (
              <p className="font-medium">{user.user_metadata.name}</p>
            )}
            {user.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/new-topic" className="cursor-pointer">
            <PenSquare className="mr-2 h-4 w-4" />
            <span>Yeni Konu</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Ayarlar</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600"
          onSelect={(event) => {
            event.preventDefault();
            signOut();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Çıkış Yap</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 