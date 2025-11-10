import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db/client";
import { authors, categories, postGroupTags, postGroups, posts, tags } from "@/src/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { parseTags, slugify } from "@/src/lib/utils";

const BodySchema = z.object({
  slug: z.string().min(1),
  categoryId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  tags: z.string().optional().default(""),
  coverUrl: z.string().url().optional().nullable(),
  locale: z.string().min(2),
  title: z.string().min(1),
  bodyMd: z.string().min(1).max(200_000),
  readMinutes: z.number().int().min(0).optional(),
  draft: z.boolean().default(true),
  publishNow: z.boolean().default(false),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const session = (await auth()) as any;
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const [row] = await db
      .select({
        id: posts.id,
        slug: postGroups.slug,
        categoryId: postGroups.categoryId,
        authorId: postGroups.authorId,
        coverUrl: postGroups.coverUrl,
        locale: posts.locale,
        title: posts.title,
        bodyMd: posts.bodyMd,
        readMinutes: posts.readMinutes,
        draft: posts.draft,
      })
      .from(posts)
      .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .where(eq(posts.id, id))
      .limit(1);
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const trows = await db
      .select({ slug: tags.slug })
      .from(postGroupTags)
      .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
      .where(eq(postGroupTags.groupId, (await db.select({ id: postGroups.id }).from(postGroups).where(eq(postGroups.slug, row.slug)).limit(1))[0]?.id || 0));

    return NextResponse.json({
      ...row,
      readMinutes: row.readMinutes ?? 0,
      tags: trows.map((t: any) => t.slug),
    });
  } catch (error: any) {
    console.error("Error in GET /api/admin/posts/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const session = (await auth()) as any;
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }
    const v = parsed.data;
    const slug = slugify(v.slug);
    const tagList = parseTags(v.tags || "");

    await db.transaction(async (tx: any) => {
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

      const base: Record<string, unknown> = {
        groupId: grp.id,
        locale: v.locale,
        title: v.title,
        bodyMd: v.bodyMd,
        readMinutes: v.readMinutes ?? null,
        draft: publishNow ? false : v.draft,
        updatedAt: sql`now()`,
      };
      if (publishNow) {
        base[posts.publishedAt.name] = sql`now()`;
      }
      await tx
        .update(posts)
        .set(base)
        .where(eq(posts.id, id));

      // Update tags: clear and set
      const groupId = grp.id;
      await tx.delete(postGroupTags).where(eq(postGroupTags.groupId, groupId));
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
          await tx.insert(postGroupTags).values({ groupId, tagId }).onConflictDoNothing();
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/posts/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const session = (await auth()) as any;
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await db.delete(posts).where(eq(posts.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/posts/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
