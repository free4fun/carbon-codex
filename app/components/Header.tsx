"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
// Replaced next/link usages with SilentLink for programmatic navigation without status bar URLs
import SilentLink from "./SilentLink";
import Image from "next/image";
import { Icon } from '@iconify/react';
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

interface NavLinkItem {
  href: string;
  label: string;
  isActive: boolean;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Extract locale from pathname (e.g., /en/... or /es/...)
  const locale: Locale = pathname.startsWith("/es") ? "es" : "en";
  const t = locale === "en" ? en : es;

  // persist menu state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("menuOpen");
      if (saved === "1") setMenuOpen(true);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("menuOpen", menuOpen ? "1" : "0");
    } catch (e) {
      // ignore
    }
  }, [menuOpen]);

  const toggleLang = () => {
    const newLocale = locale === "en" ? "es" : "en";

    // Get the current path without the locale prefix
    let pathWithoutLocale = pathname;
    if (pathname.startsWith("/en/")) {
      pathWithoutLocale = pathname.slice(3); // Remove "/en"
    } else if (pathname.startsWith("/es/")) {
      pathWithoutLocale = pathname.slice(3); // Remove "/es"
    } else if (pathname === "/en" || pathname === "/es") {
      pathWithoutLocale = "/";
    }

    // Construct new URL with new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Navigate to the new URL
    window.location.href = newPath;
  };

  // Helper to check if a link is active
  // Root path (/) never shows as active
  // Other paths show active only when exact match
  const isActive = (path: string) => {
    // Normalize paths for comparison
    const normalizedPathname = pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
    const normalizedPath = path.endsWith("/") && path !== "/"
      ? path.slice(0, -1)
      : path;

    // Root path never active
    if (normalizedPath === "/") {
      return false;
    }

    // Consider locale prefix (e.g. /en/collections) or direct match
    // If pathname ends with the path (e.g. '/en/collections' endsWith '/collections') treat as active
    if (normalizedPathname === normalizedPath) return true;
    try {
      return normalizedPathname.endsWith(normalizedPath);
    } catch (e) {
      return false;
    }
  };

  // Navigation links configuration
  const navLinks: NavLinkItem[] = [
    {
      href: "/categories",
      label: t["nav.categories"],
      isActive: isActive("/categories"),
    },
    {
      href: "/tags",
      label: t["nav.tags"],
      isActive: isActive("/tags"),
    },
    {
      href: "/writers",
      label: t["nav.writers"],
      isActive: isActive("/writers"),
    },
    {
      href: "/survey",
      label: t["nav.survey"],
      isActive: isActive("/survey"),
    },
  ];

  // Reusable NavLink component
  const NavLink = ({ href, label, isActive, className = "" }: NavLinkItem & { className?: string }) => (
    <SilentLink
      href={href}
      className={`${className} font-semibold link-underline-hover ${isActive ? "!text-magenta" : "hover:!text-magenta transition-colors"}`}
      ariaLabel={label}
    >
      {label}
    </SilentLink>
  );

  return (
    <header className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <SilentLink href="/" ariaLabel={t.siteName} className="group flex items-center gap-3">
          <span className="relative inline-block h-8 w-8">
            <Image src="/carboncodex.svg" alt={t.siteName} fill className="object-contain" />
          </span>
          <span className="font-semibold text-lg">
            {t.siteName}
          </span>
        </SilentLink>

        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-6 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <NavLink {...link} />
              </li>
            ))}
            {/* Search link */}
            <li>
              <SilentLink
                href="/search"
                ariaLabel={t["home.searchPlaceholder"]}
                className="flex items-center gap-2  rounded transition-colors hover:text-magenta"
              >
                
                <Icon icon="tabler:search" className="w-5 h-5" />
              </SilentLink>
            </li>
            <li>
              <button
                onClick={toggleLang}
                className="font-semibold ml-2 px-3 py-1 rounded text-sm bg-transparent flex items-center gap-2 border border-magenta btn-fill-hover"
                title={locale === "en" ? t["spanish"] : t["english"]}
              >
                <Icon icon="tabler:world" className="w-4.5 h-4.5" />
                <span>{locale === "en" ? t["spanish"] : t["english"]}</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className="p-2 rounded-md border border-magenta flex items-center justify-center"
          >
            {menuOpen ? (
              <Icon icon="tabler:x" className="w-4.5 h-4.5" />
            ) : (
              <Icon icon="tabler:menu-2" className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel - animated */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 transform px-6 pb-4 ${menuOpen ? "max-h-60 opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
          }`}
      >
        <ul className="flex flex-col gap-3 text-sm">
          {navLinks.map((link) => (
            <li key={link.href}>
              <NavLink {...link} className="block" />
            </li>
          ))}
          {/* Search link mobile */}
          <li>
            <SilentLink
              href="/search"
              ariaLabel={t["home.searchPlaceholder"]}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-magenta/10 transition-colors"
            >
              <Icon icon="tabler:search" className="w-5 h-5" />
            </SilentLink>
          </li>
          <li className="pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLang}
                className="px-3 py-1 rounded text-sm bg-transparent w-28 flex items-center gap-2 justify-center transition-all border border-magenta hover:border-magenta text-foreground"
                aria-label="Toggle language"
              >
                <Icon icon="tabler:world" className="w-4.5 h-4.5" />
                <span className="text-sm">{locale === "en" ? t["spanish"] : t["english"]}</span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </header>
  );
}
