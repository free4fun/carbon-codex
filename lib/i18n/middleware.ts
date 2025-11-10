import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, type Locale } from './config';
import { getLocale } from './locale-detector';

export function i18nMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract locale and rewrite to the actual page
    const locale = pathname.split('/')[1] as Locale;
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    
    const response = NextResponse.rewrite(
      new URL(pathWithoutLocale, request.url)
    );
    
    // Add custom header with the locale for server components
    response.headers.set('x-locale', locale);
    
    // Save locale preference in cookie
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000, // 1 año
      sameSite: 'lax'
    });
    
    return response;
  }

  // Redirect to locale-prefixed URL
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  return NextResponse.redirect(newUrl);
}
