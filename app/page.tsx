import SilentLink from "./components/SilentLink";
import CategoryImage from "./components/CategoryImage";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import PostCard from "@/app/components/PostCard";
import FeaturedPostCard from "@/app/components/FeaturedPostCard";
import { getLatestPosts, getCategories } from "@/src/lib/blog";
import { Icon } from '@iconify/react';

type Locale = "en" | "es";

export default async function Home({ searchParams = {} }: { searchParams?: any }) {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') as Locale) || 'en';
  const t = locale === "en" ? en : es;
  const { items: latest } = await getLatestPosts(locale, 6);
  const cats = await getCategories(locale);

  return (
    <main className="flex flex-col">
      {/* Recent Posts Section - Nearly full viewport */}
      <section className="w-full flex items-center mb-6 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">{t["home.recentPosts"]}</h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">{t["home.recentPostsSubtitle"]}</p>
          
          {latest.length === 0 ? (
            <p className="text-text-gray">{t["home.noPosts"]}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-6 md:mb-8 lg:items-stretch">
              {/* Featured post - left side (4/7 width) */}
              {latest[0] && (
                <div className="lg:col-span-4 h-full">
                  <FeaturedPostCard post={latest[0]} />
                </div>
              )}
              {/* Minor posts - right side (3/7 width), 3 wider cards stacked with equal spacing */}
              <div className="lg:col-span-3 flex flex-col justify-between h-full gap-3">
                {latest.slice(1, 4).map((p) => (
                  <PostCard key={p.slug + p.locale} post={p} />
                ))}
              </div>
            </div>
          )}
          
          {/* View all posts button */}
          <div className="py-6 flex text-center justify-center">
            <SilentLink
              href="/categories"
              ariaLabel={t["home.viewAllPosts"]}
              className="inline-block px-5 md:px-6 py-2.5 md:py-3 bg-magenta md:bg-magenta/20 border border-magenta btn-fill-hover transition-colors rounded-lg font-semibold text-sm md:text-base"
            >
              {t["home.viewAllPosts"]}<Icon icon="tabler:arrow-right" className="h-4.5 w-4.5 inline-block ml-1"/>
            </SilentLink>
          </div>
        </div>
      </section>

      {/* Explore Section with Search */}
      <section className="w-full flex items-center mb-6 px-6 md:my-20 ">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold md:mb-16">
            {t["home.exploreTitle"]}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">
            {t["home.exploreDescription"]}
          </p>
          <form action="/search" method="get" className="relative max-w-2xl w-full mx-auto rounded-lg border border-magenta/40 focus:border-magenta hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-colors transition-all group">
            <input
              type="text"
              name="q"
              placeholder={t["home.searchPlaceholder"]}
              className="w-full px-4 md:px-6 py-3 md:py-4 text-sm md:text-base focus:outline-none placeholder:text-text-gray"
            />
            <div className="flex items-center gap-2">
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 border border-magenta bg-magenta md:bg-magenta/20 hover:bg-magenta transition-colors rounded-lg font-semibold text-sm md:text-base inline-flex items-center justify-center gap-2">
                <Icon icon="tabler:search" className="h-5 w-5" />
                {t["home.searchPlaceholder"]}
            </button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Section - Full viewport on md+ only */}
      <section className="w-full flex items-center mb-6 px-6 md:min-h-screen">
        <div className="max-w-7xl mx-auto w-full py-8">
          {/* Heading + subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-4xl font-bold mb-3">{t["home.categoriesTitle"]}</h2>
            <p className="text-base md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">{t["home.categoriesSubtitle"]}</p>
          </div>
          {/* Categories grid - compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((category) => (
              <SilentLink
                key={category.slug}
                href={`/categories/${category.slug}`}
                ariaLabel={category.name}
                className="bg-surface group overflow-hidden flex flex-col rounded-lg border border-magenta/40 focus:border-magenta hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-colors transition-all group"
              >
                <div className="relative w-full overflow-hidden pb-[50%]">
                  <CategoryImage
                    src={category.imageUrl}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 group-hover:text-magenta transition-colors">
                    <Icon icon="tabler:bookmarks" className="w-4.5 h-4.5" />
                    <span className="text-sm md:text-xl font-semibold leading-tight">
                      {category.name}
                    </span>
                    </div>
                    <span className="flex items-center gap-1 text-sm group-hover:text-magenta whitespace-nowrap">
                      <Icon icon="tabler:notes" className="h-4.5 w-4.5"/>
                      {category.count} {t["page.articles"]}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm md:text-lg text-text-gray group-hover:text-white line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </SilentLink>
            ))}
          </div>
        </div>
      </section>

      {/* Survey Section */}
      <section className="w-full flex items-center mb-6 px-6 md:my-20 ">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold md:mb-16 text-magenta">
            {t["home.surveyTitle"]}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">
            {t["home.surveyDescription"]}
          </p>
          <div className="py-6 flex text-center justify-center">
          <SilentLink
            href="/survey"
            ariaLabel={t["home.takeSurvey"]}
            className="inline-block px-6 py-3 md:py-4 bg-magenta md:bg-magenta/20 border border-magenta btn-fill-hover transition-colors rounded-lg font-semibold text-sm md:text-base gap-2"
          >
            {t["home.takeSurvey"]}<Icon icon="tabler:arrow-right" className="h-5 w-5"/>
          </SilentLink>
          </div>
        </div>
      </section>
    </main>
  );
}
