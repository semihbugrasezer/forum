import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });
  const { data: { session } } = await supabase.auth.getSession();

  const path = request.nextUrl.pathname;
  
  // Check if the route requires authentication
  if (protectedRoutes.some(route => path.startsWith(route))) {
    // If user is not authenticated, redirect to login with return URL
    if (!session) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', path);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Handle basic forum access - ensure it's not blocking after authentication
  if (path.startsWith('/forum') && session) {
    // Add user context to headers for logging if needed
    response.headers.set('X-User-Id', session.user?.id || '');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};