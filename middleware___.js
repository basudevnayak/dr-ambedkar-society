// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Define public paths
  const isPublicPath = path === '/admin/login' || path === '/admin/register';
  
  // Get the token from cookies
  const token = request.cookies.get('token')?.value || '';
  
  // Redirect logic
  if (isPublicPath && token) {
    // If on public path but has token, redirect to dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  if (!isPublicPath && !token && path.startsWith('/admin')) {
    // If on protected admin path but no token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths to run middleware on
export const config = {
  matcher: '/admin/:path*',
};