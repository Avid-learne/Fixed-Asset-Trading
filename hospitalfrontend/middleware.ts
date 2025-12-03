// hospitalfrontend/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Redirect to appropriate dashboard based on role
    if (path === '/') {
      if (token?.role === 'PATIENT') {
        return NextResponse.redirect(new URL('/patient', req.url))
      } else if (token?.role === 'HOSPITAL_STAFF' || token?.role === 'HOSPITAL_ADMIN') {
        return NextResponse.redirect(new URL('/hospital', req.url))
      } else if (token?.role === 'BANK_OFFICER') {
        return NextResponse.redirect(new URL('/bank', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/patient/:path*',
    '/hospital/:path*',
    '/bank/:path*',
  ],
}