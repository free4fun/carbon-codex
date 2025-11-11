import SilentLink from "./components/SilentLink";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Search } from "lucide-react";
import PostCard from "@/app/components/PostCard";
import FeaturedPostCard from "@/app/components/FeaturedPostCard";
import { getLatestPosts, getCategories } from "@/src/lib/blog";

type Locale = "en" | "es";

export default async function Home() {
  const headersList = await headers();
  const locale = (headersList.get('x-locale') as Locale) || 'en';
  
  const t = locale === "en" ? en : es;
  const { items: latest } = await getLatestPosts(locale, 6);
  const cats = await getCategories(locale);

  return (
    <main className="flex flex-col">
      {/* Recent Posts Section - Nearly full viewport */}
      <section className="w-full flex items-center py-1 md:py-4 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">{t["home.recentPosts"]}</h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray leading-relaxedmb-6 md:mb-8">{t["home.recentPostsSubtitle"]}</p>
          
          {latest.length === 0 ? (
            <p className="text-text-gray">No posts yet.</p>
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
          <div className="text-center mt-6 md:mt-8">
            <SilentLink
              href="/collections"
              ariaLabel={t["home.viewAllPosts"]}
              className="inline-block px-5 md:px-6 py-2.5 md:py-3 bg-magenta/20 border border-magenta btn-fill-hover transition-colors rounded-lg font-semibold text-sm md:text-base"
            >
              {t["home.viewAllPosts"]}
            </SilentLink>
          </div>
        </div>
      </section>

      {/* Explore Section with Search - Full viewport */}
      <section className="w-full flex items-center py-1 md:py-4 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl md:text-4xl font-bold leading-tight">
            {t["home.exploreTitle"]}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
            {t["home.exploreDescription"]}
          </p>
          <div className="relative max-w-2xl w-full mx-auto my-40 rounded-lg border border-magenta/40 focus:border-magenta hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-colors transition-all group">
            <input
              type="text"
              placeholder={t["home.searchPlaceholder"]}
              className="w-full px-4 md:px-6 py-3 md:py-4 text-sm md:text-base focus:outline-none placeholder:text-text-gray"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 border border-magenta bg-magenta/40 hover:bg-magenta transition-colors rounded-lg font-semibold text-sm md:text-base inline-flex items-center justify-center">
              <Search className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section - Full viewport */}
      <section className="w-full min-h-screen px-6 flex items-center">
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
                className="group overflow-hidden flex flex-col rounded border border-magenta/40 focus:border-magenta hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-colors transition-all group"
              >
                {category.imageUrl ? (
                  <div className="relative w-full overflow-hidden pb-[50%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.imageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="relative w-full pb-[50%]"/>
                )}
                <div className="p-3 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm md:text-xl font-semibold group-hover:text-magenta transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <span className="text-xs text-magenta whitespace-nowrap">
                      {category.count} {t["page.articles"]}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm md:text-lg text-text-gray line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </SilentLink>
            ))}
          </div>
        </div>
      </section>

      {/* Survey Section - Full viewport - Centered */}
      <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-6">
        <div className="max-w-3xl mx-auto text-center w-full">
          <h2 className="text-2xl md:text-4xl font-bold mb-10 md:mb-16 text-magenta leading-tight">
            {t["home.surveyTitle"]}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">
            {t["home.surveyDescription"]}
          </p>
          
          <SilentLink
            href="/survey"
            ariaLabel={t["home.takeSurvey"]}
            className="inline-block px-6 md:px-8 py-3 md:py-4 bg-magenta hover:bg-violet transition-colors rounded-lg font-semibold text-base md:text-lg btn-fill-hover"
          >
            {t["home.takeSurvey"]} →
          </SilentLink>
        </div>
      </section>
    </main>
  );
}
