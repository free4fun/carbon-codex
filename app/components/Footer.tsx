"use client";
import { Icon } from '@iconify/react';

import { usePathname } from "next/navigation";
import SilentLink from "./SilentLink";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Copyright } from "lucide-react";

type Locale = "en" | "es";

export default function Footer() {
  const pathname = usePathname();
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  const t = locale === "en" ? en : es;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="border-t border-magenta/40 pt-8">
          <div className="flex justify-center items-center">
            <span className="text-sm flex items-center gap-1">
              <SilentLink href="/" ariaLabel={t.siteName} className="text-magenta font-semibold">{t.siteName}</SilentLink>
              <Icon icon="tabler:copyright" className="inline w-4.5 h-4.5" aria-hidden="true" /> {currentYear}. {t["footer.rights"]}.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
