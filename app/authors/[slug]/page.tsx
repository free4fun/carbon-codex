import SilentLink from "../../components/SilentLink";
import Image from "next/image";
import { headers } from "next/headers";
import { authors, authorTranslations, postGroups, posts } from "@/src/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import PostCard from "@/app/components/PostCard";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { db } = await import("@/src/db/client");
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
  const { slug } = await params;

  const authorData = await db.execute<{
    id: number;
    slug: string;
    name: string;
    bio: string | null;
    avatar_url: string | null;
    website_url: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    x_url: string | null;
  }>(sql`
    SELECT a.id, a.slug, a.name, 
           COALESCE(at.bio, a.bio) as bio,
           a.avatar_url, a.website_url, a.linkedin_url, a.github_url, a.x_url
    FROM authors a
    LEFT JOIN author_translations at ON at.author_id = a.id AND at.locale = ${locale}
    WHERE a.slug = ${slug}
    LIMIT 1
  `);
  
  if (authorData.rows.length === 0) {
    return <div className="mx-auto max-w-3xl px-4 py-12">Author not found</div>;
  }
  
  const authorRow = authorData.rows[0];
  const author = {
    id: authorRow.id,
    slug: authorRow.slug,
    name: authorRow.name,
    bio: authorRow.bio,
    avatarUrl: authorRow.avatar_url,
    websiteUrl: authorRow.website_url,
    linkedinUrl: authorRow.linkedin_url,
    githubUrl: authorRow.github_url,
    xUrl: authorRow.x_url,
  };

  const items = await db
    .select({
      slug: postGroups.slug,
      title: posts.title,
      description: posts.description,
      locale: posts.locale,
      coverUrl: postGroups.coverUrl,
      readMinutes: posts.readMinutes,
      publishedAt: posts.publishedAt,
      authorSlug: authors.slug,
      authorName: authors.name,
      authorAvatarUrl: authors.avatarUrl,
      catSlug: sql<string>`NULL`,
      catName: sql<string>`NULL`,
      catImageUrl: sql<string>`NULL`,
    })
    .from(posts)
    .innerJoin(postGroups, eq(posts.groupId, postGroups.id))
    .innerJoin(authors, eq(postGroups.authorId, authors.id))
    .where(and(eq(postGroups.authorId, author.id), eq(posts.locale, locale), eq(posts.draft, false), sql`posts.published_at IS NOT NULL`))
    .orderBy(desc(posts.publishedAt));

  return (
    <main className="px-6 py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-8 mb-10">
        <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full overflow-hidden bg-surface border border-violet/30 shadow-sm">
          {author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatarUrl} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            <Image src="/carboncodex.svg" alt={author.name} fill className="object-contain p-4" />
          )}
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-cyan tracking-tight">{author.name}</h1>
          {author.bio ? <p className="text-text-gray mt-2 leading-relaxed max-w-2xl">{author.bio}</p> : null}
          <div className="mt-2 flex gap-3 text-sm">
            {(() => {
              const norm = (url: string | null) => {
                if (!url) return url;
                if (/^https?:\/\//i.test(url)) return url;
                return `https://${url}`;
              };
              return (
                <>
                  {author.websiteUrl ? (
                    <a href={norm(author.websiteUrl)!} target="_blank" rel="noopener noreferrer" className="underline">🌐 Website</a>
                  ) : null}
                  {author.linkedinUrl ? (
                    <a href={norm(author.linkedinUrl)!} target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a>
                  ) : null}
                  {author.githubUrl ? (
                    <a href={norm(author.githubUrl)!} target="_blank" rel="noopener noreferrer" className="underline">GitHub</a>
                  ) : null}
                  {author.xUrl ? (
                    <a href={norm(author.xUrl)!} target="_blank" rel="noopener noreferrer" className="underline">X</a>
                  ) : null}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="mt-10">
        {items.length === 0 ? (
          <p className="text-text-gray">No posts yet.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <PostCard
                key={p.slug + p.locale}
                post={{
                  slug: p.slug,
                  title: p.title,
                  description: p.description ?? null,
                  locale: p.locale,
                  coverUrl: p.coverUrl,
                  readMinutes: p.readMinutes ? Number(p.readMinutes) : null,
                  author: { slug: author.slug, name: author.name, avatarUrl: author.avatarUrl },
                  category: { slug: null, name: null, imageUrl: null },
                  publishedAt: p.publishedAt,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <SilentLink href="/" ariaLabel="Back to home" className="text-violet hover:text-magenta transition-colors">← Back to home</SilentLink>
      </div>
    </main>
  );
}
