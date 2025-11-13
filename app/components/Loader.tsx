import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export default function Loader() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const locale = pathname.startsWith("/es") ? "es" : "en";
  const t = locale === "en" ? en : es;
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center">
      <span className="relative inline-flex items-center justify-center" aria-busy="true" aria-live="polite" role="status">
        <span className="h-8 w-8 rounded-full border-2 border-magenta/60 border-t-transparent animate-spin" />
        <span className="sr-only">{t["loader.loading"]}</span>
      </span>
    </div>
  );
}
