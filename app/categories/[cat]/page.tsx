import { headers } from "next/headers";
import PostCard from "@/app/components/PostCard";
import { authors, categories, categoryTranslations, postGroups, posts } from "@/src/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

type Props = { params: Promise<{ cat: string }> };

export const revalidate = 60;

export default async function CategoryPage({ params }: Props) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
  const { cat } = await params;
  const { db } = await import("@/src/db/client");

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
    .where(eq(categories.slug, cat))
    .limit(1);

  const category = categoryRows[0] ? {
    id: categoryRows[0].id,
    slug: categoryRows[0].slug,
    name: categoryRows[0].translatedName || categoryRows[0].name,
    description: categoryRows[0].translatedDescription || categoryRows[0].description,
    imageUrl: categoryRows[0].imageUrl,
  } : null;

  const rows = await db
    .select({
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(categories, eq(postGroups.categoryId, categories.id))
    .leftJoin(authors, eq(postGroups.authorId, authors.id))
    .where(
      and(
        eq(categories.slug, cat),
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(24);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={category?.imageUrl || "/carboncodex.svg"} alt="" className="w-full aspect-video object-cover rounded border mb-4" />
        <h1 className="text-3xl font-bold mb-2">{category?.name || cat}</h1>
        {category?.description ? (
          <p className="text-base text-text-gray leading-relaxed">{category.description}</p>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <p className="text-text-gray">No posts yet.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p: any) => (
            <PostCard
              key={p.slug}
              post={{
                slug: p.slug,
                title: p.title,
                description: p.description ?? null,
                locale,
                coverUrl: p.coverUrl,
                readMinutes: p.readMinutes ? Number(p.readMinutes) : null,
                author: { slug: p.authorSlug, name: p.authorName, avatarUrl: p.authorAvatarUrl },
                category: { slug: cat, name: category?.name || cat, imageUrl: category?.imageUrl || null },
                publishedAt: p.publishedAt,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
