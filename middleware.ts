import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl
  
  // Handle subdomain routing
  const subdomain = hostname.split('.')[0]
  
  // Check if it's a subdomain and redirect to appropriate portal
  if (subdomain === 'admin' && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/admin-portal', request.url))
  }
  
  if (subdomain === 'student' && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/student-portal', request.url))
  }
  
  if (subdomain === 'teacher' && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/teacher-portal', request.url))
  }
  
  // Continue with session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
