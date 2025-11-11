import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const { db } = await import("@/src/db/client");
  const [{ count: postsCount }] = (
    await db.execute(
      sql`SELECT COUNT(*)::int as count FROM posts`
    )
  ).rows;
  const [{ count: groupsCount }] = (
    await db.execute(
      sql`SELECT COUNT(*)::int as count FROM post_groups`
    )
  ).rows;
  const [{ count: catsCount }] = (
    await db.execute(
      sql`SELECT COUNT(*)::int as count FROM categories`
    )
  ).rows;
  const [{ count: authorsCount }] = (
    await db.execute(
      sql`SELECT COUNT(*)::int as count FROM authors`
    )
  ).rows;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { label: "Posts (locales)", value: Number(postsCount) },
        { label: "Groups", value: Number(groupsCount) },
        { label: "Categories", value: Number(catsCount) },
        { label: "Authors", value: Number(authorsCount) },
      ].map((c) => (
        <div key={c.label} className="border rounded p-4">
          <div className="text-sm text-text-gray">{c.label}</div>
          <div className="text-2xl font-bold">{c.value}</div>
        </div>
      ))}

      <div className="sm:col-span-2 lg:col-span-4">
        <div className="flex gap-3">
          <a className="px-3 py-2 rounded border hover:bg-[var(--surface)]" href="/admin/posts/new">
            New post
          </a>
          <a className="px-3 py-2 rounded border hover:bg-[var(--surface)]" href="/admin/posts">
            Manage posts
          </a>
          <a className="px-3 py-2 rounded border hover:bg-[var(--surface)]" href="/admin/categories">
            Manage categories
          </a>
          <a className="px-3 py-2 rounded border hover:bg-[var(--surface)]" href="/admin/authors">
            Manage authors
          </a>
        </div>
      </div>
    </div>
  );
}
