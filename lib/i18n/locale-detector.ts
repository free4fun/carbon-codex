import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './config';

export function detectLocaleFromUrl(pathname: string): Locale | null {
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  return pathnameLocale || null;
}

export function detectLocaleFromBrowser(request: NextRequest): Locale | null {
  const acceptLanguage = request.headers.get('accept-language');
  
  if (acceptLanguage) {
    const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(browserLocale as Locale)) {
      return browserLocale as Locale;
    }
  }
  
  return null;
}

export function detectLocaleFromCookie(request: NextRequest): Locale | null {
  const cookie = request.cookies.get('NEXT_LOCALE');
  if (cookie?.value && locales.includes(cookie.value as Locale)) {
    return cookie.value as Locale;
  }
  return null;
}

export function getLocale(request: NextRequest): Locale {
  const pathname = request.nextUrl.pathname;
  
  // 1. Check if URL already has a locale
  const urlLocale = detectLocaleFromUrl(pathname);
  if (urlLocale) return urlLocale;
  
  // 2. Check user preference cookie
  const cookieLocale = detectLocaleFromCookie(request);
  if (cookieLocale) return cookieLocale;
  
  // 3. Check Accept-Language header
  const browserLocale = detectLocaleFromBrowser(request);
  if (browserLocale) return browserLocale;
  
  // 4. Default locale
  return defaultLocale;
}
