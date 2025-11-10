import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') as Locale) || 'en';
  const t = locale === "en" ? en : es;

  return {
    title: t.siteName,
    description: t.tagline,
    icons: {
      icon: "/carboncodex.svg",
      shortcut: "/carboncodex.ico",
    },
    metadataBase: new URL("https://carboncodex.net"),
    openGraph: {
      title: t.siteName,
      description: t.tagline,
      images: [
        {
          url: '/carboncodex.png',
          width: 800,
          height: 800,
          alt: `${t.siteName} — ${t.tagline}`,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t.siteName,
      description: t.tagline,
      images: ['/carboncodex.png'],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use the same header-based locale resolution as metadata to keep <html lang> consistent.
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";

  // Adding suppressHydrationWarning because dev overlays (HotReload / static indicators)
  // can temporarily mutate <html> or <body> styles before React hydrates, producing benign diffs.
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen" suppressHydrationWarning>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
