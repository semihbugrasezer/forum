import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Korumalı sayfalar listesi
const protectedRoutes = [
  '/new-topic',
  '/user-profile',
  '/forum/notifications',
  '/forum/messages',
  '/forum/profile',
  '/forum/new-topic',
];

// Admin-only sayfalar
const adminRoutes = [
  '/admin',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Auth durumunu kontrol et
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  const path = req.nextUrl.pathname
  
  // URL'leri küçük harfe çevirme - SEO dostu URL yapısı
  if (path !== path.toLowerCase()) {
    return NextResponse.redirect(
      new URL(path.toLowerCase(), req.url)
    )
  }
  
  // Eski forum URL yapısından yeni yapıya yönlendirme
  if (path === '/(forum)' || path.startsWith('/(forum)/')) {
    const newPath = path.replace(/^\/(forum)/, '/forum')
    console.log(`Yönlendiriliyor: ${path} -> ${newPath}`)
    return NextResponse.redirect(new URL(newPath, req.url))
  }
  
  // Admin kontrol fonksiyonu (örnek kontrol: e-posta "@thy.com" ile mi bitiyor?)
  const isAdmin = user?.email?.endsWith('@thy.com') || user?.email?.includes('admin') || false
  
  // Korumalı sayfa kontrolü
  if (protectedRoutes.some(route => path.startsWith(route))) {
    if (!user) {
      // Kullanıcı giriş yapmamış ve korumalı bir sayfaya erişmeye çalışıyor
      // Giriş sayfasına yönlendir ve dönüş URL'ini parametre olarak ekle
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', path)
      return NextResponse.redirect(redirectUrl)
    }
  }
  

  if (adminRoutes.some(route => path.startsWith(route))) {
    if (!user || !isAdmin) {
      // Kullanıcı admin değil veya giriş yapmamış
      return NextResponse.redirect(new URL('/', req.url))
    }
  }
  
  // Auth sayfalarına giriş yapmış kullanıcıların erişim kontrolü
  if (user && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
    // Kullanıcı zaten giriş yapmış, ana sayfaya yönlendir
    return NextResponse.redirect(new URL('/', req.url))
  }
  
  return res
}

// Middleware'in çalışacağı path'ler
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 