import { posts, postGroups, postGroupTags, tags } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import PostForm, { type PostFormValues } from "@/src/components/admin/PostForm";
import { auth } from "@/src/lib/auth";
import { parseTags, slugify } from "@/src/lib/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function updatePost(id: number, values: PostFormValues) {
  "use server";
  const session = (await auth()) as any;
  if (!session?.user?.is_admin) {
    throw new Error("Unauthorized");
  }

  const { db } = await import("@/src/db/client");
  const slug = slugify(values.slug || "");
  const tagList = parseTags(values.tags || "");

  // Forzar draft a booleano
  const draft = typeof values.draft === "string" ? values.draft === "true" : !!values.draft;

  await db.transaction(async (tx: any) => {
    // Get current post data FIRST
    const [current] = await tx
      .select({ publishedAt: posts.publishedAt, groupId: posts.groupId })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    // Convert string IDs to numbers, handling empty strings
    const categoryId = values.categoryId && values.categoryId !== "" ? Number(values.categoryId) : null;
    const authorId = values.authorId && values.authorId !== "" ? Number(values.authorId) : null;

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

    // publishedAt: asignar siempre que draft sea false y no tenga fecha
    const base: Record<string, unknown> = {
      groupId: grp.id,
      locale: values.locale,
      title: values.title,
      description: values.description || null,
      bodyMd: values.bodyMd,
      readMinutes: values.readMinutes ?? null,
      draft,
    };

    // Manejar publishedAt según el estado de draft
    if (draft) {
      // Si es draft, borrar publishedAt
      base.publishedAt = null;
    } else {
      // Si no es draft y no tiene publishedAt, asignarlo ahora
      if (!current?.publishedAt) {
        base.publishedAt = sql`now()`;
      }
      // Si ya tenía publishedAt, no lo tocamos (se mantiene)
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
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { db } = await import("@/src/db/client");
  const { id: idParam } = await params;
  const id = Number(idParam);
  const [row] = await db
    .select({
      slug: postGroups.slug,
      categoryId: postGroups.categoryId,
      authorId: postGroups.authorId,
      coverUrl: postGroups.coverUrl,
      locale: posts.locale,
      title: posts.title,
      description: posts.description,
      bodyMd: posts.bodyMd,
      readMinutes: posts.readMinutes,
      draft: posts.draft,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .where(eq(posts.id, id))
    .limit(1);

  const trows = await db
    .select({ slug: tags.slug })
    .from(postGroupTags)
    .innerJoin(tags, eq(postGroupTags.tagId, tags.id))
    .where(eq(postGroupTags.groupId, (await db.select({ gid: postGroups.id }).from(postGroups).where(eq(postGroups.slug, row.slug)).limit(1))[0]?.gid || 0));

  const initial: Partial<PostFormValues> = {
    slug: row.slug,
    categoryId: row.categoryId ? String(row.categoryId) : "",
    authorId: row.authorId ? String(row.authorId) : "",
    coverUrl: row.coverUrl || "",
    locale: row.locale,
    title: row.title,
    description: row.description || "",
    bodyMd: row.bodyMd,
    readMinutes: row.readMinutes ?? 0,
    draft: row.draft,
    tags: trows.map((t: any) => t.slug).join(","),
  };

  async function onSubmit(values: PostFormValues) {
    "use server";
    await updatePost(id, values);
    redirect("/admin/posts");
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-2xl font-semibold">Edit Post</h1>
      <PostForm onSubmit={onSubmit} initial={initial} />
    </div>
  );
}
