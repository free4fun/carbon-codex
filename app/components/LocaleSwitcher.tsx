"use client";

import { useEffect } from "react";

export default function LocaleSwitcher({
  currentLocale,
  otherLocales,
  slug,
}: {
  currentLocale: string;
  otherLocales: string[];
  slug: string;
}) {
  useEffect(() => {
    console.log("LocaleSwitcher Debug:", { currentLocale, otherLocales, slug });
  }, [currentLocale, otherLocales, slug]);
  
  if (!otherLocales?.length) {
    console.log("No other locales available");
    return null;
  }
  
  const handleLocaleChange = (locale: string) => {
    // Guardar la preferencia de idioma en una cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    
    const url = `/${locale}/blog/${slug}`;
    console.log("Navigating to:", url);
    window.location.href = url;
  };
  
  return (
    <div className="flex items-center gap-2 text-sm border border-violet/30 hover:border-magenta transition-colors px-3 py-1 rounded">
      <span className="text-text-gray">Language:</span>
      <span className="font-medium uppercase">{currentLocale}</span>
      <span className="text-text-gray">|</span>
      {otherLocales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className="underline underline-offset-2 hover:text-cyan transition-colors uppercase cursor-pointer font-medium"
          type="button"
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
