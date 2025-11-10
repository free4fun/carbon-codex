import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db/client";
import { authors, authorTranslations } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { slugify } from "@/src/lib/utils";

const BodySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  bio: z.string().optional().nullable(),
  // Allow relative or absolute avatar URL (supports /uploads/... as well)
  avatarUrl: z.string().refine(
    (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
    { message: "Invalid url" }
  ).optional().nullable(),
  // Allow URLs without protocol; we'll normalize to https:// during save
  websiteUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  githubUrl: z.string().optional().nullable(),
  xUrl: z.string().optional().nullable(),
  translations: z.array(z.object({
    locale: z.string().min(2),
    bio: z.string().optional().nullable(),
  })).optional().default([]),
});

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
    const normalizeUrl = (val?: string | null) => {
      if (!val) return null;
      const s = val.trim();
      if (!s) return null;
      if (/^https?:\/\//i.test(s)) return s;
      if (/^\/\//.test(s)) return `https:${s}`;
      return `https://${s}`;
    };
    await db.transaction(async (tx: any) => {
      await tx
        .update(authors)
        .set({
          slug: slugify(v.slug),
          name: v.name,
          bio: v.bio || null,
          avatarUrl: v.avatarUrl || null,
          websiteUrl: normalizeUrl(v.websiteUrl),
          linkedinUrl: normalizeUrl(v.linkedinUrl),
          githubUrl: normalizeUrl(v.githubUrl),
          xUrl: normalizeUrl(v.xUrl),
        })
        .where(eq(authors.id, id));

      // Insert or update translations
      if (v.translations && v.translations.length > 0) {
        for (const trans of v.translations) {
          await tx
            .insert(authorTranslations)
            .values({
              authorId: id,
              locale: trans.locale,
              bio: trans.bio || null,
            })
            .onConflictDoUpdate({
              target: [authorTranslations.authorId, authorTranslations.locale],
              set: {
                bio: trans.bio || null,
              },
            });
        }
      }
    });
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/authors/[id]:", error);
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
    await db.delete(authors).where(eq(authors.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/authors/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
