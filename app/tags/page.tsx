// ...existing code...
import SilentLink from "../components/SilentLink";
import { Icon } from '@iconify/react';
import { headers } from "next/headers";
import { getTags, getTagsCount } from "@/src/lib/blog";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

export const revalidate = 60;

type Locale = "en" | "es";

const TAGS_PER_PAGE = 24;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function TagsPage({ searchParams }: Props) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const offset = (page - 1) * TAGS_PER_PAGE;

  const [tags, totalTags] = await Promise.all([
    getTags(locale, TAGS_PER_PAGE, offset),
    getTagsCount(locale),
  ]);

  const totalPages = Math.ceil(totalTags / TAGS_PER_PAGE);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (page <= 3) {
        pages.push(2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <main className="flex flex-col">
      <section className="w-full flex items-center mb-6 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <header className="mb-6 md:mb-8">
            <h1 className="text-3xl md:text-5xl font-extrabold  tracking-tight mb-2">
              {t["nav.tags"]}
            </h1>
            <p className="text-base md:text-xl text-text-gray font-medium leading-relaxed">
              {t["home.tagsSubtitle"]}
            </p>
          </header>
          {tags.length === 0 ? (
            <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
              {t["tags.noTags"]}
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tags.map((tag: { slug: string; name: string; count: number }) => (
                  <SilentLink
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    ariaLabel={tag.name}
                    className="group rounded-lg border border-magenta/30 focus:border-magenta hover:border-magenta bg-surface p-3 flex flex-col justify-between shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.12),0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.18),0_2px_6px_rgba(0,0,0,0.12)] transition-all min-h-[56px]"
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon="tabler:hash" className="h-5 w-5 text-magenta group-hover:scale-110 transition-transform" />
                      <h3 className="text-base md:text-lg font-semibold group-hover:text-magenta transition-colors uppercase">
                        {tag.name}
                      </h3>
                    </div>
                    <div className="flex items-end gap-1 mt-2">
                      <Icon icon="tabler:notes" className="h-4.5 w-4.5 text-text-gray " />
                      <span className="text-xs md:text-sm text-text-gray  font-semibold">
                        {tag.count} {t["page.articles"]}
                      </span>
                    </div>
                  </SilentLink>
                ))}
              </div>
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2 mt-12 mb-8" aria-label="Pagination">
                  {/* Previous button */}
                  <SilentLink
                    href={page > 1 ? (page === 2 ? `/tags` : `/tags?page=${page - 1}`) : '#'}
                    ariaLabel={locale === "es" ? "Página anterior" : "Previous page"}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all font-medium border border-transparent hover:border-magenta/40 ${
                      page === 1 ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-magenta/10'
                    }`}
                  >
                    <Icon icon="mdi:chevron-left" className="w-4 h-4" />
                    <span className="hidden sm:inline">{t["pagination.previous"]}</span>
                  </SilentLink>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum: number | string, idx: number) => (
                      typeof pageNum === 'number' ? (
                        <SilentLink
                          key={idx}
                          href={pageNum === 1 ? `/tags` : `/tags?page=${pageNum}`}
                          ariaLabel={`${locale === "es" ? "Página" : "Page"} ${pageNum}`}
                          className={`min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center ${
                            pageNum === page
                              ? 'bg-magenta text-white border-2 border-magenta shadow-lg shadow-magenta/30 cursor-default pointer-events-none'
                              : 'border border-magenta/30 hover:border-magenta hover:bg-magenta/10'
                          }`}
                        >
                          {pageNum}
                        </SilentLink>
                      ) : (
                        <span key={idx} className="px-2 text-text-gray/50">
                          {pageNum}
                        </span>
                      )
                    ))}
                  </div>

                  {/* Next button */}
                  <SilentLink
                    href={page < totalPages ? `/tags?page=${page + 1}` : '#'}
                    ariaLabel={locale === "es" ? "Página siguiente" : "Next page"}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-all font-medium border border-transparent hover:border-magenta/40 ${
                      page === totalPages ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'hover:bg-magenta/10'
                    }`}
                  >
                    <span className="hidden sm:inline">{t["pagination.next"]}</span>
                    <Icon icon="mdi:chevron-right" className="w-4 h-4" />
                  </SilentLink>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
