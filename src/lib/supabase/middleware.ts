import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
            try {
              return request.cookies.get(name)?.value
            } catch (error) {
              console.error(`Error getting cookie ${name} in middleware:`, error)
              return undefined
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              // Set cookie in the request for this middleware execution
              request.cookies.set({
                name,
                value,
                ...options,
                // Ensure secure cookies in production
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
              
              // Set cookie in the response to be sent to the client
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              
              response.cookies.set({
                name,
                value,
                ...options,
                // Ensure secure cookies in production
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            } catch (error) {
              console.error(`Error setting cookie ${name} in middleware:`, error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              // Delete cookie in the request for this middleware execution
              request.cookies.delete(name)
              
              // Set an expired cookie in the response
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              
              response.cookies.set({
                name,
                value: '',
                ...options,
                maxAge: 0,
                // Ensure secure cookies in production
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
              })
            } catch (error) {
              console.error(`Error removing cookie ${name} in middleware:`, error)
            }
          },
        },
      }
    )

    // Refresh the session using getUser() instead of getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('Error refreshing session:', userError)
    }
  } catch (error) {
    console.error('Error in auth middleware:', error)
  }

  return response
} 