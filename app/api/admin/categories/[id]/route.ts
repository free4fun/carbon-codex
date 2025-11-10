import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db/client";
import { categories, categoryTranslations } from "@/src/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { slugify } from "@/src/lib/utils";

const BodySchema = z.object({
  slug: z.string().optional().default(""),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  imageUrl: z.string().refine(
    (val) => !val || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/"),
    { message: "Invalid url" }
  ).optional().nullable(),
  translations: z.array(z.object({
    locale: z.string().min(2),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
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
    
    await db.transaction(async (tx: any) => {
      await tx
        .update(categories)
        .set({ slug: slugify(v.name), name: v.name, description: v.description || null, imageUrl: v.imageUrl || null })
        .where(eq(categories.id, id));

      // Insert or update translations
      if (v.translations && v.translations.length > 0) {
        for (const trans of v.translations) {
          await tx
            .insert(categoryTranslations)
            .values({
              categoryId: id,
              locale: trans.locale,
              name: trans.name,
              description: trans.description || null,
            })
            .onConflictDoUpdate({
              target: [categoryTranslations.categoryId, categoryTranslations.locale],
              set: {
                name: trans.name,
                description: trans.description || null,
              },
            });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in PUT /api/admin/categories/[id]:", error);
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
    await db.delete(categories).where(eq(categories.id, id));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/admin/categories/[id]:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
