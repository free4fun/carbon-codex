import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { i18nMiddleware } from './lib/i18n/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bypass i18n and protect /admin paths
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isAdmin = Boolean((token as any)?.is_admin);
    if (!isAdmin && !pathname.startsWith('/admin/login')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // All other routes go through i18n middleware
  return i18nMiddleware(request);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!_next|api|.*\\.).*)',
  ],
};
