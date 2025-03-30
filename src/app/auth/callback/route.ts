import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

    if (code) {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ 
        cookies: () => cookieStore 
      })
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        throw error
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(
      `${new URL(request.url).origin}/auth/login?error=Authentication%20failed`
    )
  }
}