import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
  
  if (code) {
    // Create a new response to redirect
    const response = NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // This is only used for setting cookies in the response
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            // This is only used for removing cookies in the response
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
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/login?error=${encodeURIComponent(error.message)}`
        )
      }
      
      return response
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Authentication%20failed`
      )
    }
  }
  
  // If no code is present in the URL, redirect to home page
  return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
}