import SilentLink from "../components/SilentLink";
import { headers } from "next/headers";
import { getCategories } from "@/src/lib/blog";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

export const revalidate = 60;

export default async function CollectionsPage() {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;
  const cats = await getCategories(locale);

  return (
    <main className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan mb-6">
          {t["nav.categories"]}
        </h1>
        {cats.length === 0 ? (
          <p className="text-text-gray">No categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c: { slug: string; name: string; description: string | null; imageUrl: string | null; count: number }) => (
              <SilentLink
                key={c.slug}
                href={`/categories/${c.slug}`}
                ariaLabel={c.name}
                className="group p-5 bg-surface/50 border border-violet/20 rounded-lg hover:border-magenta transition-all flex flex-col"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.imageUrl || "/carboncodex.svg"} alt="" className="w-full aspect-video object-cover rounded mb-3 border" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold group-hover:text-magenta transition-colors">{c.name}</h3>
                  <span className="text-xs text-violet">{c.count} articles</span>
                </div>
                {c.description ? (
                  <p className="mt-2 text-xs text-text-gray line-clamp-3">{c.description}</p>
                ) : null}
              </SilentLink>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
