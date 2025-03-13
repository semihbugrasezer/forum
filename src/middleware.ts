import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Properly configure Supabase client with URL and key
  const supabase = createMiddlewareClient(
    { req: request, res: response },
    { 
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! 
    }
  )

  await supabase.auth.getSession()
  
  // Handle root route and make sure it's working
  if (request.nextUrl.pathname === '/') {
    return response;
  }
  
  return response
}

// Only run middleware on auth-related paths and the homepage
export const config = {
  matcher: ['/', '/auth/:path*', '/profile/:path*', '/admin/:path*'],
};