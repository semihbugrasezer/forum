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
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(k);
      }
    }
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

export async function middleware(req: NextRequest) {
  try {
    // Apply rate limiting
    const clientIp = req.headers.get('x-forwarded-for') ?? 'unknown';
    const path = req.nextUrl.pathname;

    if (!checkRateLimit(clientIp, path)) {
      return errorResponse(429, 'Too Many Requests');
    }

    // Create a response to modify
    let response = NextResponse.next();
    
    // Create Supabase client - Updated for Next.js 15
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return req.cookies.get(name)?.value
          },
          set(name, value, options) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            req.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
              maxAge: 0,
            })
          },
        },
      }
    );
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // IMPORTANT: Avoid logic between createServerClient and getUser
    const { data: { user } } = await supabase.auth.getUser();
    
    // SEO-friendly URL structure
    if (path !== path.toLowerCase()) {
      return NextResponse.redirect(new URL(path.toLowerCase(), req.url));
    }
    
    // Legacy URL structure redirection
    if (path === '/(forum)' || path.startsWith('/(forum)/')) {
      const newPath = path.replace(/^\/(forum)/, '/forum');
      console.log(`Redirecting: ${path} -> ${newPath}`);
      return NextResponse.redirect(new URL(newPath, req.url));
    }
    
    // Admin role verification with enhanced security
    const isAdmin = () => {
      if (!user) return false;
      
      // Development environment check with additional security
      if (process.env.NODE_ENV === 'development' && 
          process.env.NEXT_PUBLIC_ADMIN_ACCESS === 'true' &&
          process.env.DEVELOPMENT_ADMIN_EMAIL === user.email) {
        return true;
      }
      
      return user.email?.endsWith('@thy.com') || 
             user.app_metadata?.roles?.includes('admin') || 
             false;
    };
    
    // Protected route access control
    if (protectedRoutes.some(route => path.startsWith(route))) {
      if (!user) {
        const redirectUrl = new URL('/auth/login', req.url);
        redirectUrl.searchParams.set('redirectTo', path);
        return NextResponse.redirect(redirectUrl);
      }
    }
    
    // Admin route access control with enhanced security
    if (adminRoutes.some(route => path.startsWith(route))) {
      if (!user || !isAdmin()) {
        console.warn(`Unauthorized admin access attempt: ${path} by ${user?.email ?? 'unknown'}`);
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    // Authenticated user redirection from auth pages
    if (user && (path.startsWith('/auth/login') || path.startsWith('/auth/register'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Add user context to headers for logging
    if (user) {
      response.headers.set('X-User-Id', user.id);
      response.headers.set('X-User-Role', isAdmin() ? 'admin' : 'user');
    }
    
    // Add caching headers for public, cacheable routes
    const isCacheable = 
      (path === '/' || 
       path.startsWith('/forum') || 
       path.startsWith('/search')) && 
      req.method === 'GET' && 
      !user; // Only cache for anonymous users
    
    return addCacheHeaders(response, isCacheable);
  } catch (error) {
    console.error('Middleware error:', error);
    return errorResponse(500, 'Internal Server Error');
  }
}

// Middleware matcher configuration
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}