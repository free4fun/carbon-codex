import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db/client";
import { authors, categories, postGroupTags, postGroups, posts, tags } from "@/src/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { z } from "zod";
import { parseTags, slugify } from "@/src/lib/utils";

const BodySchema = z.object({
  slug: z.string().default(""), // Allow empty; will auto-gen from title
  categoryId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  tags: z.string().optional().default(""),
  coverUrl: z.string().refine(
    (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
    { message: "Invalid url" }
  ).optional().nullable(),
  locale: z.string().min(2),
  title: z.string().min(1),
  bodyMd: z.string().min(1).max(200_000),
  readMinutes: z.number().int().min(0).optional(),
  draft: z.boolean().default(true),
  publishNow: z.boolean().default(false),
});

function requireAdmin(session: any) {
  if (!session?.user?.is_admin) {
    throw new Error("Unauthorized");
  }
}

export async function GET(req: Request) {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const locale = searchParams.get("locale") || undefined;
    const category = searchParams.get("category") || undefined;
    const draft = searchParams.get("draft") || undefined;
    const cursor = searchParams.get("cursor") || undefined;
    const after = cursor ? new Date(cursor) : undefined;

    const rows = await db
      .select({
        id: posts.id,
        slug: postGroups.slug,
        title: posts.title,
        locale: posts.locale,
        draft: posts.draft,
        publishedAt: posts.publishedAt,
      })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
      .leftJoin(categories, eq(postGroups.categoryId, categories.id))
      .where(
        and(
          q ? ilike(posts.title, `%${q}%`) : sql`true`,
          locale ? eq(posts.locale, locale) : sql`true`,
          category ? eq(categories.slug, category) : sql`true`,
          draft === "true"
            ? eq(posts.draft, true)
            : draft === "false"
            ? eq(posts.draft, false)
            : sql`true`,
          after ? sql`coalesce(posts.published_at, posts.updated_at) < ${after}` : sql`true`
        )
      )
      .orderBy(desc(sql`coalesce(posts.published_at, posts.updated_at)`))
      .limit(25);

    return NextResponse.json({ items: rows });
  } catch (error: any) {
    console.error("Error in GET /api/admin/posts:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = (await auth()) as any;
    try {
      requireAdmin(session);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const v = parsed.data;
    // Auto-generate slug from title if empty
    const slug = v.slug.trim() ? slugify(v.slug) : slugify(v.title);
    const tagList = parseTags(v.tags || "");

    // Transaction: upsert group and insert post
    await db.transaction(async (tx: any) => {
        // Upsert group
        const [grp] = await tx
          .insert(postGroups)
          .values({
            slug,
            categoryId: v.categoryId ? Number(v.categoryId) : null,
            authorId: v.authorId ? Number(v.authorId) : null,
            coverUrl: v.coverUrl || null,
          })
          .onConflictDoUpdate({
            target: postGroups.slug,
            set: {
              categoryId: v.categoryId ? Number(v.categoryId) : null,
              authorId: v.authorId ? Number(v.authorId) : null,
              coverUrl: v.coverUrl || null,
            },
          })
          .returning({ id: postGroups.id });

        const publishNow = v.publishNow && v.draft === false ? true : v.publishNow;

        await tx
          .insert(posts)
          .values({
            groupId: grp.id,
            locale: v.locale,
            title: v.title,
            bodyMd: v.bodyMd,
            readMinutes: v.readMinutes ?? null,
            draft: publishNow ? false : v.draft,
            publishedAt: publishNow ? new Date() : null,
          })
          .onConflictDoUpdate({
            target: [posts.groupId, posts.locale],
            set: (() => {
              const base: Record<string, unknown> = {
                title: v.title,
                bodyMd: v.bodyMd,
                draft: publishNow ? false : v.draft,
                updatedAt: sql`now()`,
              };
              if (publishNow) {
                base[posts.publishedAt.name] = sql`now()`;
              }
              return base;
            })(),
          });

        if (tagList.length) {
          // ensure tags exist
          for (const t of tagList) {
            const [tg] = await tx
              .insert(tags)
              .values({ slug: t, name: t })
              .onConflictDoNothing()
              .returning({ id: tags.id });
            const tagId = tg?.id || (
              (await tx.select({ id: tags.id }).from(tags).where(eq(tags.slug, t)).limit(1))[0]
                ?.id as number
            );
            if (tagId) {
              await tx
                .insert(postGroupTags)
                .values({ groupId: grp.id, tagId })
                .onConflictDoNothing();
            }
          }
        }
      });


    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in POST /api/admin/posts:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
