import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseCookie, parseSupabaseCookie } from '@/lib/utils/cookies'

// Rate limiting configuration - use environment variables with fallbacks
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10); // 1 minute default
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS_PER_WINDOW || '200', 10); // Increased to 200 requests for higher traffic
// Using a more memory-efficient implementation for high traffic
const rateLimitStore: Map<string, { count: number; timestamp: number }> = new Map();

// Cache TTL settings for different content types - use environment variables with fallbacks
const CACHE_TTL = {
  static: parseInt(process.env.CACHE_TTL_STATIC || '86400', 10), // 24 hours for static content
  public: parseInt(process.env.CACHE_TTL_PUBLIC || '3600', 10), // 1 hour for public content
  dynamic: parseInt(process.env.CACHE_TTL_DYNAMIC || '300', 10), // 5 minutes for dynamic content
};

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

// Cache helper for response caching with improved headers
function addCacheHeaders(res: NextResponse, routeType: 'static' | 'public' | 'dynamic' | 'none' = 'none') {
  if (routeType === 'none') {
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    return res;
  }
  
  const ttl = CACHE_TTL[routeType];
  
  // Add cache headers appropriate for the content type
  res.headers.set('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${Math.floor(ttl/2)}`);
  
  // Add Vary header to properly cache based on device and content negotiation
  res.headers.set('Vary', 'Accept, Accept-Encoding, Accept-Language, User-Agent');
  
  return res;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: true,
        },
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)?.value
            if (!cookie) return undefined
            // Base64 ile kodlanmış değeri çöz
            if (cookie.startsWith('base64-')) {
              try {
                return JSON.parse(Buffer.from(cookie.slice(7), 'base64').toString('utf-8'));
              } catch (error) {
                console.error('Cookie parse hatası (middleware):', error);
                return undefined;
              }
            }
            return cookie
          },
          set(name: string, value: string, options: CookieOptions) {
            // JSON string'e çevir, sonra base64 kodla
            let cookieValue;
            try {
              const sessionValue = typeof value === 'string' ? value : JSON.stringify(value);
              cookieValue = 'base64-' + Buffer.from(sessionValue).toString('base64');
            } catch (error) {
              console.error('Cookie encoding hatası:', error);
              cookieValue = value; // Fallback to original value
            }
            
            response.cookies.set({
              name,
              value: cookieValue,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
          },
        },
      }
    )

    // Get user session using getSession() instead of getUser()
    const sessionCookie = request.cookies.get('sb-session')?.value;
    const session = parseSupabaseCookie(sessionCookie);

    // Admin role verification
    const isAdmin = () => {
      if (!session) return false
      
      // Development environment check
      if (process.env.NODE_ENV === 'development' && 
          process.env.NEXT_PUBLIC_ADMIN_ACCESS === 'true') {
        // If DEVELOPMENT_ADMIN_EMAIL is not set, allow any email in development mode
        if (!process.env.DEVELOPMENT_ADMIN_EMAIL || 
            process.env.DEVELOPMENT_ADMIN_EMAIL === session.user.user_metadata.email) {
          return true
        }
      }
      
      return session.user.user_metadata.email?.endsWith('@thy.com') || 
             session.user.user_metadata.app_metadata?.roles?.includes('admin') || 
             false
    }

    // Protected route access control
    if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!session?.user) {
        const redirectUrl = new URL('/auth/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Admin route access control
    if (adminRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      if (!session || !isAdmin()) {
        console.warn(`Unauthorized admin access attempt: ${request.nextUrl.pathname} by ${session?.user.user_metadata.email ?? 'unknown'}`)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Authenticated user redirection from auth pages
    if (session && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/register'))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Identify route type for optimized caching
    let routeType: 'static' | 'public' | 'dynamic' | 'none' = 'none';
    
    // Static assets get longest cache time
    if (publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      routeType = 'static';
    } 
    // Public routes that can be cached for all users
    else if ((request.nextUrl.pathname === '/' || 
        request.nextUrl.pathname.startsWith('/forum') || 
        request.nextUrl.pathname.startsWith('/search')) && 
        request.method === 'GET' && 
        !session) {
      routeType = 'public';
    }
    // Dynamic but still cacheable content
    else if (request.method === 'GET' && 
        !adminRoutes.some(route => request.nextUrl.pathname.startsWith(route)) &&
        !request.nextUrl.pathname.includes('/edit') &&
        !request.nextUrl.pathname.includes('/new')) {
      routeType = 'dynamic';
    }
    
    return addCacheHeaders(response, routeType);
  } catch (error) {
    console.error('Error in middleware:', error)
    return errorResponse(500, 'Internal Server Error')
  }
}

// Middleware matcher configuration
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}