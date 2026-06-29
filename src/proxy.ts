import { NextResponse, type NextRequest } from 'next/server'

const SESSION_COOKIE = 'nosso-album-session'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = pathname === '/' || pathname === '/login' || pathname.startsWith('/api')

  // Check if user has a valid session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE)

  if (!sessionCookie && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (sessionCookie && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}