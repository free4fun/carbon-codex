export async function getAuthorWithTranslation(slug: string, locale: string) {
  const { db } = await import("@/src/db/client");
  const { authors, authorTranslations } = await import("@/src/db/schema");
  const rows = await db
    .select({
      id: authors.id,
      slug: authors.slug,
      name: authors.name,
      bio: authors.bio,
      avatarUrl: authors.avatarUrl,
      websiteUrl: authors.websiteUrl,
      linkedinUrl: authors.linkedinUrl,
      githubUrl: authors.githubUrl,
      xUrl: authors.xUrl,
      translatedBio: authorTranslations.bio,
    })
    .from(authors)
    .leftJoin(
      authorTranslations,
      and(
        eq(authorTranslations.authorId, authors.id),
        eq(authorTranslations.locale, locale)
      )
    )
    .where(eq(authors.slug, slug))
    .limit(1);
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    slug: rows[0].slug,
    name: rows[0].name,
    bio: rows[0].translatedBio || rows[0].bio,
    avatarUrl: rows[0].avatarUrl,
    websiteUrl: rows[0].websiteUrl,
    linkedinUrl: rows[0].linkedinUrl,
    githubUrl: rows[0].githubUrl,
    xUrl: rows[0].xUrl,
  };
}
export async function getCategoryWithTranslation(slug: string, locale: string) {
  const { db } = await import("@/src/db/client");
  const { categories, categoryTranslations } = await import("@/src/db/schema");
  const rows = await db
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
  if (!rows[0]) return null;
  return {
    id: rows[0].id,
    slug: rows[0].slug,
    name: rows[0].translatedName || rows[0].name,
    description: rows[0].translatedDescription || rows[0].description,
    imageUrl: rows[0].imageUrl,
  };
}
// Helper: fetch tags for groupIds
async function fetchTagsForGroups(groupIds: number[]): Promise<Record<number, { slug: string; name: string }[]>> {
  if (!groupIds.length) return {};
  const tagRows = await db
    .select({
      groupId: postGroupTags.groupId,
      slug: tags.slug,
      name: tags.name,
    })
    .from(postGroupTags)
    .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
    .where(inArray(postGroupTags.groupId, groupIds));
  return tagRows.reduce((acc, tr) => {
    const gid = tr.groupId as number;
    if (!acc[gid]) acc[gid] = [];
    acc[gid].push({ slug: tr.slug, name: tr.name });
    return acc;
  }, {} as Record<number, { slug: string; name: string }[]>);
}

// Helper: map post rows to PostSummary
function mapPostRows(rows: any[], tagMap: Record<number, { slug: string; name: string }[]>): PostSummary[] {
  return rows.map((r) => ({
    groupId: r.groupId,
    slug: r.slug,
    title: r.title,
    description: r.description,
    locale: r.locale,
    coverUrl: r.coverUrl,
    readMinutes: r.readMinutes ? Number(r.readMinutes) : null,
    author: { slug: r.authorSlug, name: r.authorName, avatarUrl: r.authorAvatarUrl },
    category: {
      slug: typeof r.catSlug !== "undefined" ? r.catSlug ?? null : null,
      name: typeof r.catName !== "undefined" ? r.catName ?? null : null,
      imageUrl: typeof r.catImageUrl !== "undefined" ? r.catImageUrl ?? null : null,
    },
    publishedAt: r.publishedAt,
    tags: r.groupId ? tagMap[r.groupId] || [] : [],
  }));
}
import "server-only";
import { db } from "@/src/db/client";
import {
  posts,
  postGroups,
  authors,
  categories,
  postGroupTags,
  tags,
} from "@/src/db/schema";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import readingTime from "reading-time";

export type PostSummary = {
  slug: string;
  title: string;
  description: string | null;
  locale: string;
  coverUrl: string | null;
  readMinutes: number | null;
  author: { slug: string | null; name: string | null; avatarUrl: string | null };
  category: { slug: string | null; name: string | null; imageUrl: string | null };
  publishedAt: Date | null;
  tags?: { slug: string; name: string }[];
};

export async function getLatestPosts(locale: string, limit = 10, cursor?: string) {
  const after = cursor ? new Date(cursor) : undefined;

  const rows = await db
    .select({
      groupId: posts.groupId,
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      locale: posts.locale,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catSlug: categories.slug,
      catName: categories.name,
      catImageUrl: categories.imageUrl,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .leftJoin(authors, eq(postGroups.authorId, authors.id))
    .leftJoin(categories, eq(postGroups.categoryId, categories.id))
    .where(
      and(
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`,
        after ? sql`posts.published_at < ${after}` : sql`true`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  const groupIds = rows.map((r) => r.groupId).filter(Boolean) as number[];
  const tagMap = await fetchTagsForGroups(groupIds);
  const nextCursor = rows.length === limit ? rows[rows.length - 1].publishedAt?.toISOString() : null;
  return {
    items: mapPostRows(rows, tagMap),
    nextCursor,
  };
}

export async function getPostBySlug(slug: string, locale: string) {
  const rows = await db
    .select({
      groupId: postGroups.id,
      groupSlug: postGroups.slug,
      coverUrl: postGroups.coverUrl,
      title: posts.title,
      description: posts.description,
      bodyMd: posts.bodyMd,
      readMinutes: posts.readMinutes,
      locale: posts.locale,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catSlug: categories.slug,
      catName: categories.name,
    })
    .from(postGroups)
    .leftJoin(posts, eq(posts.groupId, postGroups.id))
    .leftJoin(authors, eq(postGroups.authorId, authors.id))
    .leftJoin(categories, eq(postGroups.categoryId, categories.id))
    .where(eq(postGroups.slug, slug));

  const localeRow = rows.find((r) => r.locale === locale && !!r.publishedAt && r);
  const enRow = rows.find((r) => r.locale === "en" && !!r.publishedAt && r);
  const chosen = localeRow || enRow || rows[0];

  if (!chosen) return null;

  const tagRows = await db
    .select({ slug: tags.slug, name: tags.name })
    .from(postGroupTags)
    .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
    .where(eq(postGroupTags.groupId, chosen.groupId!));

  const otherLocales = rows
    .filter((r) => r.locale && r.locale !== chosen.locale && !!r.publishedAt)
    .map((r) => r.locale!);

  const rt = chosen.readMinutes ?? Math.max(1, Math.round(readingTime(chosen.bodyMd || "").minutes));

  return {
    group: {
      slug: chosen.groupSlug!,
      coverUrl: chosen.coverUrl,
    },
    post: {
      title: chosen.title!,
      description: chosen.description ?? null,
      bodyMd: chosen.bodyMd!,
      readMinutes: rt,
      locale: chosen.locale!,
      publishedAt: chosen.publishedAt!,
    },
    author: {
      slug: chosen.authorSlug,
      name: chosen.authorName,
      avatarUrl: chosen.authorAvatarUrl,
    },
    category: {
      slug: chosen.catSlug,
      name: chosen.catName,
    },
    tags: tagRows,
    otherLocales,
    fallback: chosen.locale !== locale,
  };
}

export async function getRelatedByTag(
  slug: string,
  locale: string,
  tag: string,
  limit = 6
) {
  const [grp] = await db
    .select({ id: postGroups.id })
    .from(postGroups)
    .where(eq(postGroups.slug, slug))
    .limit(1);
  if (!grp) return [];

  const relGroups = await db
    .select({ groupId: postGroupTags.groupId })
    .from(postGroupTags)
    .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
    .where(eq(tags.slug, tag));

  const groupIds = relGroups.map((g) => g.groupId).filter((id) => id !== grp.id);
  if (groupIds.length === 0) return [];

  const rows = await db
    .select({
      slug: postGroups.slug,
      title: posts.title,
      coverUrl: postGroups.coverUrl,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .where(
      and(
        inArray(posts.groupId, groupIds),
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`
      )
    )
    .orderBy(desc(posts.publishedAt))
    .limit(limit);

  return rows;
}

export async function getCategories(locale: string) {
  const rows = await db.execute<{
    slug: string;
    name: string;
    description: string | null;
    image_url: string | null;
    count: number;
  }>(sql`
    SELECT 
      c.slug, 
      COALESCE(ct.name, c.name) as name,
      COALESCE(ct.description, c.description) as description,
      c.image_url, 
      COALESCE(COUNT(p.id), 0)::int as count
    FROM categories c
    LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = ${locale}
    LEFT JOIN post_groups g ON g.category_id = c.id
    LEFT JOIN posts p ON p.group_id = g.id
      AND p.locale = ${locale}
      AND p.draft = false
      AND p.published_at IS NOT NULL
    GROUP BY c.slug, c.name, c.description, c.image_url, ct.name, ct.description
    ORDER BY COALESCE(ct.name, c.name) ASC
  `);

  return rows.rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.image_url,
    count: r.count,
  }));
}

export async function getAuthorsWithCounts(locale: string) {
  const rows = await db.execute<{
    slug: string;
    name: string;
    avatar_url: string | null;
    bio: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    x_url: string | null;
    posts_count: number;
  }>(sql`
    SELECT a.slug, a.name, a.avatar_url, 
           COALESCE(at.bio, a.bio) as bio,
           a.website_url, a.linkedin_url, a.github_url, a.x_url,
           COALESCE(COUNT(p.id), 0)::int as posts_count
    FROM authors a
    LEFT JOIN author_translations at ON at.author_id = a.id AND at.locale = ${locale}
    LEFT JOIN post_groups g ON g.author_id = a.id
    LEFT JOIN posts p ON p.group_id = g.id
      AND p.locale = ${locale}
      AND p.draft = false
      AND p.published_at IS NOT NULL
    GROUP BY a.slug, a.name, a.avatar_url, at.bio, a.bio, a.website_url, a.linkedin_url, a.github_url, a.x_url
    ORDER BY a.name ASC
  `);
  return rows.rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    avatarUrl: r.avatar_url,
    bio: r.bio,
    websiteUrl: r.website_url,
    linkedinUrl: r.linkedin_url,
    githubUrl: r.github_url,
    xUrl: r.x_url,
    count: r.posts_count,
  }));
}

export async function searchPosts(locale: string, q: string, limit = 20) {
  const like = `%${q}%`;
  const rows = await db.execute<{
    slug: string;
    title: string;
    cover_url: string | null;
    published_at: Date | null;
  }>(sql`
    SELECT g.slug, p.title, g.cover_url, p.published_at
    FROM posts p
    JOIN post_groups g ON g.id = p.group_id
    WHERE p.locale = ${locale}
      AND p.draft = false
      AND p.published_at IS NOT NULL
      AND (p.tsv @@ plainto_tsquery('simple', ${q})
           OR p.title ILIKE ${like})
    ORDER BY p.published_at DESC
    LIMIT ${limit}
  `);

  return rows.rows;
}

export async function getPostsByAuthorWithTags(authorId: number, locale: string) {
  const { db } = await import("@/src/db/client");
  const { postGroups, posts, authors, categories, postGroupTags, tags: tagsTable } = await import("@/src/db/schema");
  const items = await db
    .select({
      groupId: postGroups.id,
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      locale: posts.locale,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catSlug: categories.slug,
      catName: categories.name,
      catImageUrl: categories.imageUrl,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(authors, eq(postGroups.authorId, authors.id))
    .leftJoin(categories, eq(postGroups.categoryId, categories.id))
    .where(and(eq(postGroups.authorId, authorId), eq(posts.locale, locale), eq(posts.draft, false), sql`posts.published_at IS NOT NULL`))
    .orderBy(desc(posts.publishedAt));
  const groupIds = items.map((p) => p.groupId);
  const tagMap = await fetchTagsForGroups(groupIds);
  return mapPostRows(items, tagMap);
}

export async function getPostsByCategoryWithTags({ slug, locale, offset, limit }: { slug: string, locale: string, offset: number, limit: number }) {
  const { db } = await import("@/src/db/client");
  const { authors, categories, postGroups, posts, postGroupTags, tags: tagsTable } = await import("@/src/db/schema");

  // Obtener el total de posts en la categoría y el idioma actual
  const totalRows = await db
    .select({ count: sql`COUNT(DISTINCT post_groups.id)` })
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
  const total = totalRows[0]?.count ?? 0;

  // Obtener los posts paginados
  const items = await db
    .selectDistinctOn([postGroups.id], {
      groupId: postGroups.id,
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      locale: posts.locale,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catSlug: categories.slug,
      catName: categories.name,
      catImageUrl: categories.imageUrl,
      catDescription: categories.description,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(categories, eq(postGroups.categoryId, categories.id))
    .innerJoin(authors, eq(postGroups.authorId, authors.id))
    .where(
      and(
        eq(categories.slug, slug),
        eq(posts.locale, locale),
        eq(posts.draft, false),
        sql`posts.published_at IS NOT NULL`
      )
    )
    .orderBy(postGroups.id, desc(posts.publishedAt))
    .limit(limit)
    .offset(offset);
  const groupIds = items.map((p: any) => p.groupId).filter((id: number) => id);
  const tagMap = await fetchTagsForGroups(groupIds);
  return {
    items: mapPostRows(items, tagMap),
    total,
  };
}
