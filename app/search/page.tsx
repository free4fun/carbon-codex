import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import PostCard from "@/app/components/PostCard";
import AuthorPostCard from "@/app/components/AuthorPostCard";
import { searchPosts } from "@/src/lib/blog";
import { Icon } from '@iconify/react';
import Pagination from "@/app/components/Pagination";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') as string) || 'en';
  const t = locale === "en" ? en : es;
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const query = (params?.q || "").trim();
  const page = parseInt(params?.page || "1", 10);
  const PAGE_SIZE = 6;
  const offset = (page - 1) * PAGE_SIZE;
  // Modifica searchPosts para devolver { items, total }
  const { items: results, total } = query ? await searchPosts(locale, query, PAGE_SIZE, offset) : { items: [], total: 0 };
  const totalPages = Math.max(1, Math.ceil(Number(total) / PAGE_SIZE));

  return (
    <main className="flex flex-col">
      {/* Recent Posts Section - Nearly full viewport */}
      <section className="w-full flex items-center mb-6 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            {t["home.searchPlaceholder"]}
          </h2>
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
            {t["search.description"]}
          </p>
          <div className="py-6 flex text-center justify-center">
          <form action="/search" method="get" className="mb-8 flex gap-2 max-w-xl items-center">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={t["home.searchPlaceholder"]}
                    className="flex-items-center w-full h-9 px-4 text-sm border border-magenta/40 rounded-lg focus:border-magenta focus:outline-none"
              required
            />
          <div className="py-6 flex text-center justify-center">
            <button type="submit" className="h-9 px-5 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap btn-fill-hover border border-magenta bg-magenta md:bg-magenta/20">
              <Icon icon="tabler:search" className="h-5 w-5" />
              {t["home.searchPlaceholder"]}
            </button>
            </div>
            
          </form>
          </div>
          {query && (
            <p className="mb-6 text-text-gray">
              {results.length === 0
                ? t["search.noResults"]
                : `${total} ${t["search.results"]}`}
            </p>
          )}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((post: any) => (
              <AuthorPostCard key={post.slug + post.title} post={post} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination slug="search" currentPage={page} totalPages={totalPages} locale={locale} />
            </div>
          )}
        </div>
        </section>
    </main>
  );
}
