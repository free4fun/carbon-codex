import { getLatestPosts } from "@/src/lib/blog";
import { headers } from "next/headers";
import Link from "next/link";
import PostCard from "@/src/components/PostCard";

type Props = {
  searchParams: { cursor?: string };
};

export const revalidate = 60;

export default async function BlogIndex({ searchParams }: Props) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
  
  const { items, nextCursor } = await getLatestPosts(
    locale,
    12,
    searchParams.cursor
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      {items.length === 0 ? (
        <p className="text-text-gray">No posts yet.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PostCard key={p.slug + p.locale} post={p} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        {nextCursor ? (
          <Link
            className="px-4 py-2 border rounded hover:bg-[var(--surface)]"
            href={`/blog?cursor=${encodeURIComponent(nextCursor)}`}
          >
            Older posts
          </Link>
        ) : null}
      </div>
    </div>
  );
}
