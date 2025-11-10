// Dynamic DB import below to avoid build-time errors when DATABASE_URL is unset
import { posts, postGroups } from "@/src/db/schema";
import { and, eq, sql } from "drizzle-orm";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = new URL(process.env.NEXTAUTH_URL || "http://localhost:3000");

  // Allow building without a database by returning an empty sitemap when DATABASE_URL is not set
  if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    return [];
  }

  try {
    const { db } = await import("@/src/db/client");
    const rows = await db
      .select({
        slug: postGroups.slug,
        locale: posts.locale,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
      .where(and(eq(posts.draft, false), sql`posts.published_at IS NOT NULL`))
      .limit(5000);

    return rows.map((r: any) => ({
      url: new URL(`/blog/${r.slug}`, base).toString(),
      lastModified: r.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.warn("Failed to generate sitemap from DB, returning empty:", error);
    return [];
  }
}
