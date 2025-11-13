import { posts, postGroups, categories, authors } from "@/src/db/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: {
    q?: string;
    locale?: string;
    category?: string;
    draft?: string;
    cursor?: string;
  };
};

export default async function AdminPostsList({ searchParams }: Props) {
  let params: any = searchParams;
  if (!params) params = {};
  if (typeof params.then === "function") params = await params;
  const { q, locale, category, draft, cursor } = params;
  const after = cursor ? new Date(cursor) : undefined;
  const { db } = await import("@/src/db/client");

  const rows = await db
    .select({
      id: posts.id,
      slug: postGroups.slug,
      title: posts.title,
      locale: posts.locale,
      draft: posts.draft,
      publishedAt: posts.publishedAt,
      categoryName: categories.name,
      authorName: authors.name,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .leftJoin(categories, eq(postGroups.categoryId, categories.id))
    .leftJoin(authors, eq(postGroups.authorId, authors.id))
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
    .orderBy(
      desc(sql`coalesce(posts.published_at, posts.updated_at)`)
    )
    .limit(25);

  const nextCursor =
    rows.length === 25
      ? (rows[rows.length - 1].publishedAt ||
          undefined)?.toISOString()
      : null;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link className="px-3 py-2 border rounded hover:bg-[var(--surface)]" href="/admin/posts/new">
          New post
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left border-b">
            <tr>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Author</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Locale</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{r.title}</td>
                <td className="py-2 pr-3 text-text-gray">{r.authorName || "—"}</td>
                <td className="py-2 pr-3 text-text-gray">{r.categoryName || "—"}</td>
                <td className="py-2 pr-3">{r.locale}</td>
                <td className="py-2 pr-3">
                  {r.draft ? (
                    <span className="text-orange-600">Draft</span>
                  ) : r.publishedAt ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-text-gray">Unpublished</span>
                  )}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex gap-3">
                  <Link
                    className="underline underline-offset-2"
                    href={`/admin/posts/${r.id}/edit`}
                  >
                    Edit
                  </Link>
                  <form
                    action={async (formData) => {
                      'use server';
                      const { db } = await import('@/src/db/client');
                      const { posts, postGroups, postGroupTags } = await import('@/src/db/schema');
                      const { auth } = await import('@/src/lib/auth');
                      const { eq, sql } = await import('drizzle-orm');
                      const { revalidatePath } = await import('next/cache');
                      const session = (await auth()) as any;
                      if (!session?.user?.is_admin) return;
                      const id = Number(formData.get('id'));
                      if (!Number.isFinite(id)) return;
                      
                      await db.transaction(async (tx: any) => {
                        // Get the groupId before deleting
                        const [post] = await tx
                          .select({ groupId: posts.groupId })
                          .from(posts)
                          .where(eq(posts.id, id))
                          .limit(1);
                        
                        if (!post) return;
                        
                        // Delete the post
                        await tx.delete(posts).where(eq(posts.id, id));
                        
                        // Check if there are any other posts in this group
                        const [count] = await tx
                          .select({ count: sql<number>`count(*)::int` })
                          .from(posts)
                          .where(eq(posts.groupId, post.groupId));
                        
                        // If no more posts in group, delete the group and its tags
                        if (count.count === 0) {
                          await tx.delete(postGroupTags).where(eq(postGroupTags.groupId, post.groupId));
                          await tx.delete(postGroups).where(eq(postGroups.id, post.groupId));
                        }
                      });
                      
                      revalidatePath('/admin/posts');
                    }}
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <button
                      type="submit"
                      className="underline underline-offset-2 text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {nextCursor ? (
        <div className="flex justify-center">
          <Link
            className="px-3 py-2 border rounded hover:bg-[var(--surface)]"
            href={`/admin/posts?cursor=${encodeURIComponent(nextCursor)}`}
          >
            Next page
          </Link>
        </div>
      ) : null}
    </div>
  );
}
