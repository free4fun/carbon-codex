import "dotenv/config";
import { db } from "@/src/db/client";
import { categories, categoryTranslations, posts, postGroups, authors } from "@/src/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";

async function run(slugArg: string, locale = "en") {
  const slug = slugArg;
  console.log("Slug:", JSON.stringify(slug));
  console.log("Locale:", locale);

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
      and(eq(categoryTranslations.categoryId, categories.id), eq(categoryTranslations.locale, locale))
    )
    .where(eq(categories.slug, slug))
    .limit(1);

  console.log("Category eq:", categoryRows);

  if (categoryRows.length === 0) {
    const catIlike = await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(ilike(categories.slug, slug))
      .limit(5);
    console.log("Category ilike matches:", catIlike);
  }

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
      and(eq(categories.slug, slug), eq(posts.locale, locale), eq(posts.draft, false), sql`posts.published_at IS NOT NULL`)
    )
    .orderBy(desc(posts.publishedAt))
    .limit(24);

  console.log(`Posts in ${locale}:`, rows.length);

  if (rows.length === 0 && locale !== "en") {
    const rowsEn = await db
      .select({ slug: postGroups.slug })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
      .innerJoin(categories, eq(postGroups.categoryId, categories.id))
      .where(and(eq(categories.slug, slug), eq(posts.locale, "en"), eq(posts.draft, false), sql`posts.published_at IS NOT NULL`))
      .limit(24);
    console.log("Posts in en:", rowsEn.length);
  }
}

const slugArg = process.argv[2] || "blockchain-web3";
const locale = process.argv[3] || "en";
run(slugArg, locale).then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
