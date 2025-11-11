import { headers, cookies } from "next/headers";
import SilentLink from "@/app/components/SilentLink";
import CategoryPostCard from "@/app/components/CategoryPostCard";
import Pagination from "@/app/components/Pagination";
import { authors, categories, categoryTranslations, postGroups, posts, postGroupTags, tags } from "@/src/db/schema";
import { and, desc, eq, ilike, sql, inArray } from "drizzle-orm";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type MaybePromise<T> = T | Promise<T>;
type Props = { 
  params: MaybePromise<{ cat: string }>;
  searchParams: MaybePromise<{ page?: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const POSTS_PER_PAGE = 6;

export default async function CategoryPage({ params, searchParams }: Props) {
  const headersList = await headers();
  const cookieStore = await cookies();
  const locale = (headersList.get("x-locale") as string) || (cookieStore.get("NEXT_LOCALE")?.value as string) || "en";
  const p: any = params as any;
  const resolvedParams = p && typeof p.then === "function" ? await p : p;
  const rawCat = resolvedParams?.cat;
  const slug = typeof rawCat === "string" ? decodeURIComponent(rawCat).trim() : "";
  
  const sp: any = searchParams as any;
  const resolvedSearchParams = sp && typeof sp.then === "function" ? await sp : sp;
  const page = parseInt(resolvedSearchParams?.page || "1", 10);
  const offset = (page - 1) * POSTS_PER_PAGE;
  
  const { db } = await import("@/src/db/client");

  if (!slug) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Category not found.</h1>
      </div>
    );
  }

  // Fetch category with translation for current locale
  const categoryRows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      imageUrl: categories.imageUrl,
      translatedName: categoryTranslations.name,
      translatedDescription: categoryTranslations.description,
    })
    .from(categories)
    .leftJoin(
      categoryTranslations,
      and(
        eq(categoryTranslations.categoryId, categories.id),
        eq(categoryTranslations.locale, locale)
      )
    )
    .where(eq(categories.slug, slug))
    .limit(1);

  const category = categoryRows[0] ? {
    id: categoryRows[0].id,
    slug: categoryRows[0].slug,
    name: categoryRows[0].translatedName || categoryRows[0].name,
    description: categoryRows[0].translatedDescription || categoryRows[0].description,
    imageUrl: categoryRows[0].imageUrl,
  } : null;

  // Count total posts for pagination
  const countResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(categories, eq(postGroups.categoryId, categories.id))
    .where(
      and(
        eq(categories.slug, slug),
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`
      )
    );
  
  const totalPosts = countResult[0]?.count || 0;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  // Posts for this category in current locale
  const rows = await db
    .selectDistinctOn([postGroups.id], {
      groupId: postGroups.id,
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catName: categories.name,
      catImageUrl: categories.imageUrl,
      catDescription: categories.description,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(categories, eq(postGroups.categoryId, categories.id))
    .leftJoin(authors, eq(postGroups.authorId, authors.id))
    .where(
      and(
  eq(categories.slug, slug),
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`
      )
    )
    .orderBy(postGroups.id, desc(posts.publishedAt))
    .limit(POSTS_PER_PAGE + 1)
    .offset(offset);

  const t = locale === "es" ? es : en;

  // Fallback to English posts if none found in current locale
  let items = rows;
  let usedFallback = false;
  if (items.length === 0 && locale !== "en") {
    const rowsEn = await db
      .selectDistinctOn([postGroups.id], {
        groupId: postGroups.id,
        slug: postGroups.slug,
        title: posts.title,
        description: posts.description,
        coverUrl: postGroups.coverUrl,
        readMinutes: posts.readMinutes,
        publishedAt: posts.publishedAt,
        authorSlug: authors.slug,
        authorName: authors.name,
        authorAvatarUrl: authors.avatarUrl,
        catName: categories.name,
        catImageUrl: categories.imageUrl,
        catDescription: categories.description,
      })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
      .innerJoin(categories, eq(postGroups.categoryId, categories.id))
      .leftJoin(authors, eq(postGroups.authorId, authors.id))
      .where(
        and(
          eq(categories.slug, slug),
          eq(posts.locale, "en"),
          eq(posts.draft, false),
          sql`posts.published_at IS NOT NULL`
        )
      )
      .orderBy(postGroups.id, desc(posts.publishedAt))
      .limit(POSTS_PER_PAGE + 1)
      .offset(offset);
    if (rowsEn.length > 0) {
      items = rowsEn;
      usedFallback = true;
    }
  }

  // Last-resort fallback: show any-locale published posts for this category
  if (items.length === 0) {
    const rowsAny = await db
      .selectDistinctOn([postGroups.id], {
        groupId: postGroups.id,
        slug: postGroups.slug,
        title: posts.title,
        description: posts.description,
        coverUrl: postGroups.coverUrl,
        readMinutes: posts.readMinutes,
        publishedAt: posts.publishedAt,
        authorSlug: authors.slug,
        authorName: authors.name,
        authorAvatarUrl: authors.avatarUrl,
        catName: categories.name,
        catImageUrl: categories.imageUrl,
        catDescription: categories.description,
      })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
      .innerJoin(categories, eq(postGroups.categoryId, categories.id))
      .leftJoin(authors, eq(postGroups.authorId, authors.id))
      .where(
        and(
          eq(categories.slug, slug),
          eq(posts.draft, false),
          sql`posts.published_at IS NOT NULL`
        )
      )
      .orderBy(postGroups.id, desc(posts.publishedAt))
      .limit(POSTS_PER_PAGE + 1)
      .offset(offset);
    if (rowsAny.length > 0) {
      items = rowsAny;
    }
  }

  // Check if there are more posts
  const hasMore = items.length > POSTS_PER_PAGE;
  const displayItems = items.slice(0, POSTS_PER_PAGE);

  // If category lookup failed, derive basic info from first post's joined category
  const derivedCategory = !category && displayItems[0]
    ? {
        id: 0,
        slug,
        name: displayItems[0].catName as string,
        description: (displayItems[0].catDescription as string) || null,
        imageUrl: (displayItems[0].catImageUrl as string) || null,
      }
    : null;

  // Fetch tags for these posts
  const groupIds = displayItems.map((p: any) => p.groupId).filter((id: number) => id);
  let tagMap: Record<number, { slug: string; name: string }[]> = {};
  
  if (groupIds.length > 0) {
    const tagRows = await db
      .select({
        groupId: postGroupTags.groupId,
        slug: tags.slug,
        name: tags.name,
      })
      .from(postGroupTags)
      .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
      .where(inArray(postGroupTags.groupId, groupIds));

    for (const tr of tagRows) {
      if (!tagMap[tr.groupId]) tagMap[tr.groupId] = [];
      tagMap[tr.groupId].push({ slug: tr.slug, name: tr.name });
    }
  }

  return (
    <main className="flex flex-col">
      <div className="max-w-7xl mx-auto">             
        <h2 className="text-2xl md:text-4xl font-bold mb-3">{category?.name || derivedCategory?.name || slug || "Category"}</h2>
        {/*<CategoryImage
          src={category?.imageUrl || derivedCategory?.imageUrl || null}
          alt={category?.name || derivedCategory?.name || slug || "Category"}
          className="w-full md:w-1/2 aspect-video object-cover rounded-lg border mb-4 md:mx-auto"
        />*/}
        {(category?.description || derivedCategory?.description) && (
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">
            {category?.description || derivedCategory?.description}
          </p>
        )}
        {!category && !derivedCategory && (
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">Category not found.</p>
        )}
        
    
      {displayItems.length === 0 ? (
        <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">No posts yet.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((p: any) => (
              <CategoryPostCard
                key={p.groupId}
                post={{
                  slug: p.slug,
                  title: p.title,
                  description: p.description ?? null,
                  locale: usedFallback ? "en" : locale,
                  coverUrl: p.coverUrl,
                  readMinutes: p.readMinutes ? Number(p.readMinutes) : null,
                  author: { slug: p.authorSlug, name: p.authorName, avatarUrl: p.authorAvatarUrl },
                  category: category ? { slug: category.slug, name: category.name, imageUrl: category.imageUrl } : derivedCategory ? { slug, name: derivedCategory.name, imageUrl: derivedCategory.imageUrl } : null,
                  publishedAt: p.publishedAt,
                  tags: p.groupId ? tagMap[p.groupId] || [] : [],
                }}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            slug={slug}
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
