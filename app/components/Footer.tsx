"use client";

import { usePathname } from "next/navigation";
import SilentLink from "./SilentLink";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

export default function Footer() {
  const pathname = usePathname();
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  const t = locale === "en" ? en : es;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="border-t border-violet/40 pt-8">
          <div className="flex justify-center items-center">
            <span className="text-sm">
              © {currentYear} <SilentLink href="/" ariaLabel={t.siteName} className="text-cyan hover:underline">{t.siteName}</SilentLink>. {t["footer.rights"]}.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
