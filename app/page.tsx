import Link from "next/link";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Search } from "lucide-react";
import PostCard from "@/src/components/PostCard";
import FeaturedPostCard from "@/src/components/FeaturedPostCard";
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
      <section className="w-full min-h-[calc(100vh-80px)] flex items-center py-8 md:py-12 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{t["home.recentPosts"]}</h2>
          <p className="text-text-gray mb-6 md:mb-8">{t["home.recentPostsSubtitle"]}</p>
          
          {latest.length === 0 ? (
            <p className="text-text-gray">No posts yet.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-4 mb-6 md:mb-8 lg:items-start">
              {/* Featured post - left side */}
              {latest[0] && <FeaturedPostCard post={latest[0]} />}
              
              {/* Minor posts - right side, 3 smaller cards stacked with equal spacing */}
              <div className="flex flex-col justify-between lg:h-full gap-3">
                {latest.slice(1, 4).map((p) => (
                  <PostCard key={p.slug + p.locale} post={p} />
                ))}
              </div>
            </div>
          )}
          
          {/* View all posts button */}
          <div className="text-center mt-6 md:mt-8">
            <Link
              href="/collections"
              className="inline-block px-5 md:px-6 py-2.5 md:py-3 bg-violet hover:bg-magenta transition-colors rounded-lg font-semibold text-sm md:text-base"
            >
              {t["home.viewAllPosts"]}
            </Link>
          </div>
        </div>
      </section>

      {/* Explore Section with Search - Full viewport */}
      <section className="w-full min-h-screen px-6 bg-surface/30">
        <div className="max-w-7xl mx-auto w-full">
          <div className="max-w-4xl min-h-screen flex flex-col items-start justify-evenly py-12 md:py-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-magenta">
              {t["home.exploreTitle"]}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-text-gray leading-relaxed">
              {t["home.exploreDescription"]}
            </p>
            <div className="relative max-w-2xl w-full">
              <input
                type="text"
                placeholder={t["home.searchPlaceholder"]}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-background border border-violet/30 rounded-lg text-foreground placeholder:text-text-gray focus:outline-none focus:border-magenta transition-colors text-sm md:text-base"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 md:px-6 py-2 bg-violet hover:bg-magenta transition-colors rounded-lg font-semibold text-sm md:text-base inline-flex items-center justify-center">
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Full viewport */}
      <section className="w-full min-h-screen px-6 flex items-center">
        <div className="max-w-7xl mx-auto w-full py-8">
          {/* Heading + subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-cyan">{t["home.categoriesTitle"]}</h2>
            <p className="text-text-gray text-xs md:text-sm">{t["home.categoriesSubtitle"]}</p>
          </div>
          {/* Categories grid - compact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((category) => (
              <Link 
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group bg-surface/50 border border-violet/20 rounded-lg hover:border-magenta transition-all overflow-hidden flex flex-col"
              >
                {/* Image with 16:9 aspect ratio and hover effect */}
                {category.imageUrl ? (
                  <div className="relative w-full overflow-hidden" style={{ paddingBottom: '50%' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={category.imageUrl} 
                      alt="" 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  </div>
                ) : (
                  <div className="relative w-full bg-surface/80" style={{ paddingBottom: '50%' }} />
                )}
                
                {/* Content */}
                <div className="p-3 flex flex-col gap-1.5">
                  {/* Title and count in same row */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold group-hover:text-magenta transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <span className="text-[10px] text-violet whitespace-nowrap">
                      {category.count} {locale === 'es' ? 'art.' : 'art.'}
                    </span>
                  </div>
                  {/* Description */}
                  {category.description && (
                    <p className="text-xs text-text-gray/80 line-clamp-2 leading-snug">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Survey Section - Full viewport - Centered */}
      <section className="w-full min-h-screen flex flex-col justify-center py-12 md:py-16 px-6 bg-surface/30">
        <div className="max-w-3xl mx-auto text-center w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 md:mb-16 text-cyan leading-tight">
            {t["home.surveyTitle"]}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-text-gray mb-12 md:mb-20 leading-relaxed max-w-2xl mx-auto">
            {t["home.surveyDescription"]}
          </p>
          
          <Link 
            href="/survey"
            className="inline-block px-6 md:px-8 py-3 md:py-4 bg-magenta hover:bg-violet transition-colors rounded-lg font-semibold text-base md:text-lg btn-fill-hover"
          >
            {t["home.takeSurvey"]} →
          </Link>
        </div>
      </section>
    </main>
  );
}
