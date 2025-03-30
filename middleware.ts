import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration - use environment variables with fallbacks
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute default
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '100', 10); // 100 requests default
// Using a more efficient memory store implementation for high traffic
const rateLimitStore: Map<string, { count: number; timestamp: number }> = new Map();

// Protected routes configuration
const protectedRoutes = [
  '/new-topic',
  '/user-profile',
  '/forum/notifications',
  '/forum/messages',
  '/forum/profile',
  '/forum/new-topic',
  '/forum/edit',
  '/forum/delete',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/admin/users',
  '/admin/topics',
  '/admin/categories',
  '/admin/settings',
];

// Public routes that don't need rate limiting - extended for static assets
const publicRoutes = [
  '/public',
  '/_next',
  '/static',
  '/api/health',
  '/images',
  '/fonts',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
];

// More efficient rate limiting implementation for high traffic
function checkRateLimit(ip: string, path: string): boolean {
  const now = Date.now();
  const key = `${ip}:${path}`;
  
  // Skip rate limiting for public routes first - early return for efficiency
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true;
  }
  
  // Clean up old entries periodically instead of on every request
  if (now % 10000 < 100) { // Clean approximately every 10 seconds
    Array.from(rateLimitStore.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(key);
      }
    });
  }
  
  const userLimit = rateLimitStore.get(key);
  
  if (!userLimit) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return true;
  }
  
  if (userLimit.count >= MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Security headers with CSP
const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': process.env.CSP_DIRECTIVES || "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

// Error response helper with caching headers for CDN
function errorResponse(status: number, message: string) {
  return new NextResponse(
    JSON.stringify({ 
      error: message,
      status,
      timestamp: new Date().toISOString()
    }),
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
        ...securityHeaders
      }
    }
  );
}

// Cache helper for response caching
function addCacheHeaders(res: NextResponse, cacheable: boolean = false) {
  if (cacheable) {
    res.headers.set('Cache-Control', `public, max-age=${process.env.CACHE_DURATION || '3600'}, s-maxage=${process.env.CACHE_DURATION || '3600'}`);
  } else {
    res.headers.set('Cache-Control', 'no-store, max-age=0');
  }
  return res;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set(name, '', options)
        },
      },
    }
  )

  // Get user session
  const { data: { user } } = await supabase.auth.getUser()

  // Admin role verification
  const isAdmin = () => {
    if (!user) return false
    
    // Development environment check
    if (process.env.NODE_ENV === 'development' && 
        process.env.NEXT_PUBLIC_ADMIN_ACCESS === 'true' &&
        process.env.DEVELOPMENT_ADMIN_EMAIL === user.email) {
      return true
    }
    
    return user.email?.endsWith('@thy.com') || 
           user.app_metadata?.roles?.includes('admin') || 
           false
  }

  // Protected route access control
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Admin route access control
  if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!user || !isAdmin()) {
      console.warn(`Unauthorized admin access attempt: ${request.nextUrl.pathname} by ${user?.email ?? 'unknown'}`)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Authenticated user redirection from auth pages
  if (user && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Add caching headers for public, cacheable routes
  const isCacheable = 
    (request.nextUrl.pathname === '/' || 
     request.nextUrl.pathname.startsWith('/forum') || 
     request.nextUrl.pathname.startsWith('/search')) && 
    request.method === 'GET' && 
    !user; // Only cache for anonymous users

  return addCacheHeaders(response, isCacheable);
}

// Middleware matcher configuration
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}