import { NextResponse } from "next/server";
import { auth } from "@/src/lib/auth";
import { db } from "@/src/db/client";
import { categories, categoryTranslations } from "@/src/db/schema";
import { asc, eq } from "drizzle-orm";
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

export async function GET() {
  try {
    const session = (await auth()) as any;
    if (!session?.user?.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const rows = await db.select().from(categories).orderBy(asc(categories.name));
    
    // Fetch translations for all categories
    const allTranslations = await db
      .select()
      .from(categoryTranslations)
      .where(eq(categoryTranslations.locale, 'es'));
    
    // Map translations to categories
    const itemsWithTranslations = rows.map((cat) => {
      const esTranslation = allTranslations.find((t) => t.categoryId === cat.id);
      return {
        ...cat,
        translations: esTranslation ? [{
          locale: 'es',
          name: esTranslation.name,
          description: esTranslation.description,
        }] : [],
      };
    });
    
    return NextResponse.json({ items: itemsWithTranslations });
  } catch (error: any) {
    console.error("Error in GET /api/admin/categories:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
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
    const slug = slugify(v.name); // Auto-generate slug from name

    await db.transaction(async (tx: any) => {
      const [cat] = await tx
        .insert(categories)
        .values({ slug, name: v.name, description: v.description || null, imageUrl: v.imageUrl || null })
        .onConflictDoUpdate({ 
          target: categories.slug, 
          set: { name: v.name, description: v.description || null, imageUrl: v.imageUrl || null } 
        })
        .returning({ id: categories.id });

      // Insert or update translations
      if (v.translations && v.translations.length > 0) {
        for (const trans of v.translations) {
          await tx
            .insert(categoryTranslations)
            .values({
              categoryId: cat.id,
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
    console.error("Error in POST /api/admin/categories:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
