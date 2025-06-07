import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { encrypt, decrypt } from "@/routes/utils/auth";
import { tokenPayload } from '@/types/payloadType';
 
// 1. Specify protected and public routes
const protectedRoutes = ['/dashboard', '/dashboard/reservations', '/dashboard/invoices', '/dashboard/reports', '/dashboard/history']
const publicRoutes = ['/']
 
export default async function middleware(req: NextRequest) {
  // 1. Get the cookie from the request headers
  const cookie = req.cookies.get('token')?.value || '';

  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)
  
	// 3. If the cookie is not present, redirect to /login
  if (isProtectedRoute && !cookie) {
    return NextResponse.redirect(new URL('/', req.nextUrl));
  }
 
  // 4. Decrypt the session from the cookie
  // const cookie = (await cookies()).get('token')?.value
  // console.log("Cookie value: ", cookie)
  const payload = await decrypt(cookie) as tokenPayload | undefined
 
  // 5. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !payload?.username) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }
 
  // 6. Redirect to /dashboard if the user is authenticated
  if (
    isPublicRoute &&
    payload?.username &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}