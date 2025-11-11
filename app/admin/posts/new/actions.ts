"use server";

import { auth } from "@/src/lib/auth";
import { parseTags, slugify } from "@/src/lib/utils";
import { postGroups, postGroupTags, posts, tags } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import type { PostFormValues } from "@/app/components/admin/PostForm";

export async function createPostAction(values: PostFormValues) {
  const session = (await auth()) as any;
  if (!session?.user?.is_admin) {
    throw new Error("Unauthorized");
  }

  const { db } = await import("@/src/db/client");
  const slug = values.slug?.trim() ? slugify(values.slug) : slugify(values.title);
  const tagList = parseTags(values.tags || "");

  // Forzar draft a booleano
  const draft = typeof values.draft === "string" ? values.draft === "true" : !!values.draft;

  await db.transaction(async (tx: any) => {
    // Convert string IDs to numbers, handling empty strings
    const categoryId = values.categoryId && values.categoryId !== "" ? Number(values.categoryId) : null;
    const authorId = values.authorId && values.authorId !== "" ? Number(values.authorId) : null;

    // Use onConflictDoUpdate to handle existing slugs (e.g., for translations)
    const [grp] = await tx
      .insert(postGroups)
      .values({
        slug,
        categoryId,
        authorId,
        coverUrl: values.coverUrl || null,
      })
      .onConflictDoUpdate({
        target: postGroups.slug,
        set: {
          categoryId,
          authorId,
          coverUrl: values.coverUrl || null,
        },
      })
      .returning({ id: postGroups.id });

    // Check if a post already exists for this group + locale
    const [existing] = await tx
      .select({ id: posts.id, title: posts.title })
      .from(posts)
      .where(sql`${posts.groupId} = ${grp.id} AND ${posts.locale} = ${values.locale}`)
      .limit(1);

    if (existing) {
      throw new Error(
        `A post already exists with slug "${slug}" and locale "${values.locale}". ` +
        `Title: "${existing.title}". Please use a different slug or edit the existing post.`
      );
    }

    // publishedAt: asignar siempre que draft sea false
    const base: Record<string, unknown> = {
      groupId: grp.id,
      locale: values.locale,
      title: values.title,
      description: values.description || null,
      bodyMd: values.bodyMd,
      readMinutes: values.readMinutes ?? null,
      draft,
      ...(draft ? {} : { [posts.publishedAt.name]: sql`now()` })
    };

    await tx.insert(posts).values(base);

    // Insert tags
    const groupId = grp.id;
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
}
