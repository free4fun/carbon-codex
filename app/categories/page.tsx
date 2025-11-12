import SilentLink from "../components/SilentLink";
import CategoryImage from "../components/CategoryImage";
import { Icon } from '@iconify/react';
import { headers } from "next/headers";
import { getCategories } from "@/src/lib/blog";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export const revalidate = 60;

type Locale = "en" | "es";

export default async function CategoriesPage() {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;
  const cats = await getCategories(locale);

  return (
    <main className="flex flex-col">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold mb-3">
          {t["nav.categories"]}
        </h2>
        <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">{t["home.categoriesSubtitle"]}</p>
        {cats.length === 0 ? (
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">No categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cats.map((c: { slug: string; name: string; description: string | null; imageUrl: string | null; count: number }) => (
              <SilentLink
                key={c.slug}
                href={`/categories/${c.slug}`}
                ariaLabel={c.name}
                className="group rounded border border-magenta/40 focus:border-magenta hover:border-magenta bg-surface overflow-hidden flex flex-col shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-colors transition-all"
              >
                <div className="relative w-full aspect-video overflow-hidden">
                  <CategoryImage
                    src={c.imageUrl}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 transform-gpu will-change-transform group-hover:scale-[1.2]"
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm md:text-2xl font-semibold group-hover:text-magenta transition-colors">{c.name}</h3>
                    <span className="flex items-center gap-1 text-sm text-text-gray group-hover:text-magenta whitespace-nowrap">
                      <Icon icon="tabler:notes" className="h-4.5 w-4.5"/> {c.count} {t["page.articles"]}
                    </span>
                  </div>
                  {c.description ? (
                    <p className="text-sm md:text-lg text-text-gray group-hover:text-white line-clamp-2">{c.description}</p>
                  ) : null}
                </div>
              </SilentLink>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
