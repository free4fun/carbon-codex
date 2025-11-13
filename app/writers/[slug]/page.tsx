import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

import { headers, cookies } from "next/headers";
import { getAuthorWithTranslation, getPostsByAuthorWithTags } from "@/src/lib/blog";
import Pagination from "@/app/components/Pagination";
import AuthorImage from "@/app/components/AuthorImage";
import AuthorPostCard from "@/app/components/AuthorPostCard";
import SilentLink from "@/app/components/SilentLink";

export default async function AuthorPage({ params, searchParams }: { params: any; searchParams: any }) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = (headersList.get("x-locale") as string) || (cookieStore.get("NEXT_LOCALE")?.value as string) || "en";
  // Resolve params/searchParams if promises
  const t = locale === "es" ? es : en;
  const p: any = params && typeof params.then === "function" ? await params : params;
  const resolvedParams = p || {};
  const rawSlug = resolvedParams?.slug;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug).trim() : "";

  const sp: any = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams;
  const resolvedSearchParams = sp || {};
  const page = parseInt(resolvedSearchParams?.page || "1", 10);
  const PAGE_SIZE = 6;
  if (!slug) {
    return <div className="mx-auto max-w-3xl px-4 py-12">{t["writers.notFound"]}</div>;
  }
  const author = await getAuthorWithTranslation(slug, locale);
  if (!author) {
    return <div className="mx-auto max-w-3xl px-4 py-12">{t["writers.notFound"]}</div>;
  }
  const items = await getPostsByAuthorWithTags(author.id, locale);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <main className="flex flex-col">
      <div className="max-w-7xl mx-auto">             
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{author.name}</h2>
        <div className="flex flex-row items-center gap-8 w-full py-4">
            <AuthorImage src={author.avatarUrl} alt={author.name} className="w-1/3" />
          <div className="flex flex-col justify-center flex-1 h-full">
            {author.bio ? (
              <p className="mb-9 leading-relaxed max-w-2xl">{author.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 mt-2">
              {author.websiteUrl && (
                <SilentLink
                  href={author.websiteUrl}
                  ariaLabel="Website"
                  className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover gap-1"
                  target="_blank"
                >{t["author.website"]}</SilentLink>
              )}
              {author.linkedinUrl && (
                <SilentLink
                  href={author.linkedinUrl}
                  ariaLabel="LinkedIn"
                  className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover gap-1"
                  target="_blank"
                >{t["author.linkedin"]}</SilentLink>
              )}
              {author.githubUrl && (
                <SilentLink
                  href={author.githubUrl}
                  ariaLabel="GitHub"
                  className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover gap-1"
                  target="_blank"
                >{t["author.github"]}</SilentLink>
              )}
              {author.xUrl && (
                <SilentLink
                  href={author.xUrl}
                  ariaLabel="X"
                  className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover gap-1"
                  target="_blank"
                >{t["author.twitter"]}</SilentLink>
              )}
            </div>
          </div>
        </div>
  <h2 className="text-2xl font-bold text-white pt-13">{t["writers.postsBy"]} {author.name}</h2>
        {items.length === 0 ? (
          <p className="text-text-gray">{t["home.noPosts"]}</p>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pagedItems.map((p) => (
                <AuthorPostCard
                  key={p.slug + p.locale}
                  post={{
                    slug: p.slug,
                    title: p.title,
                    description: p.description ?? null,
                    locale: p.locale,
                    coverUrl: p.coverUrl,
                    readMinutes: p.readMinutes ? Number(p.readMinutes) : null,
                    author: { slug: author.slug, name: author.name, avatarUrl: author.avatarUrl },
                    category: p.category,
                    publishedAt: p.publishedAt,
                    tags: p.tags,
                  }}
                />
              ))}
            </div>
            {/* Pagination */}
            <Pagination
              slug={author.slug}
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
