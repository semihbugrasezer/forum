import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // Maximum requests per window
const rateLimitStore: { [key: string]: { count: number; timestamp: number } } = {};

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

// Public routes that don't need rate limiting
const publicRoutes = [
  '/public',
  '/_next',
  '/static',
  '/api/health',
];

// Rate limiting function with IP and path based limits
function checkRateLimit(ip: string, path: string): boolean {
  const now = Date.now();
  const key = `${ip}:${path}`;
  
  // Clean up old entries
  Object.keys(rateLimitStore).forEach(k => {
    if (now - rateLimitStore[k].timestamp > RATE_LIMIT_WINDOW) {
      delete rateLimitStore[k];
    }
  });
  
  // Skip rate limiting for public routes
  if (publicRoutes.some(route => path.startsWith(route))) {
    return true;
  }
  
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = { count: 1, timestamp: now };
    return true;
  }
  
  const userLimit = rateLimitStore[key];
  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore[key] = { count: 1, timestamp: now };
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

// Error response helper
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
        ...securityHeaders
      }
    }
  );
}

export async function middleware(req: NextRequest) {
  try {
    // Apply rate limiting
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';
    const path = req.nextUrl.pathname;

    if (!checkRateLimit(ip, path)) {
      return errorResponse(429, 'Too Many Requests');
    }

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
    
    // Auth state check with caching
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return errorResponse(401, 'Authentication failed');
    }

    const user = session?.user;
    
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
      res.headers.set('X-User-Id', user.id);
      res.headers.set('X-User-Role', isAdmin() ? 'admin' : 'user');
    }
    
    return res;
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