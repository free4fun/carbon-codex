import { headers, cookies } from "next/headers";
import CategoryPostCard from "@/app/components/CategoryPostCard";
import Pagination from "@/app/components/Pagination";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { getPostsByTagWithTags } from "@/src/lib/blog";

type MaybePromise<T> = T | Promise<T>;
type Props = { 
  params: MaybePromise<{ slug: string }>;
  searchParams: MaybePromise<{ page?: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const POSTS_PER_PAGE = 6;

export default async function TagPage({ params, searchParams = {} }: Props) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = (headersList.get("x-locale") as string) || (cookieStore.get("NEXT_LOCALE")?.value as string) || "en";
  let resolvedParams: any = params;
  if (!resolvedParams) resolvedParams = {};
  if (typeof resolvedParams.then === "function") resolvedParams = await resolvedParams;
  const rawSlug = resolvedParams?.slug;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug).trim() : "";

  let resolvedSearchParams: any = searchParams;
  if (!resolvedSearchParams) resolvedSearchParams = {};
  if (typeof resolvedSearchParams.then === "function") resolvedSearchParams = await resolvedSearchParams;
  const page = parseInt(resolvedSearchParams?.page || "1", 10);
  const offset = (page - 1) * POSTS_PER_PAGE;

  const t = locale === "es" ? es : en;
  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{t["tags.notFound"]}</h1>
      </div>
    );
  }

  const { items, total, tag } = await getPostsByTagWithTags({ slug, locale, offset, limit: POSTS_PER_PAGE });
  
  // Calculate total pages
  const totalCount = typeof total === 'string' ? parseInt(total, 10) : Number(total);
  const totalPages = Math.max(1, Math.ceil(totalCount / POSTS_PER_PAGE));

  if (!tag) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
  <h1 className="text-3xl font-bold mb-2">{t["tags.notFound"]}</h1>
      </div>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="max-w-7xl mx-auto">             
        <h2 className="text-2xl md:text-4xl font-bold mb-3">
          <span className=""></span>{tag.name}
        </h2>
        <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
          {totalCount} {totalCount === 1 ? t["page.article"] : t["page.articles"]} {t["tags.taggedWith"]} "{tag.name}"
        </p>
        
        {items.length === 0 ? (
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
            {t["home.noPosts"]}
          </p>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p: any) => (
                <CategoryPostCard
                  key={p.groupId || p.slug}
                  post={{
                    slug: p.slug,
                    title: p.title,
                    description: p.description ?? null,
                    locale: locale,
                    coverUrl: p.coverUrl,
                    readMinutes: p.readMinutes ? Number(p.readMinutes) : null,
                    author: p.author,
                    category: p.category,
                    publishedAt: p.publishedAt,
                    tags: p.tags,
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              slug={`tags/${slug}`}
              currentPage={page}
              totalPages={totalPages}
              locale={locale}
            />
          </>
        )}
      </div>
    </main>
  );
}
