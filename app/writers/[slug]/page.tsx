
import { headers } from "next/headers";
import { getAuthorWithTranslation, getPostsByAuthorWithTags } from "@/src/lib/blog";
import AuthorImage from "@/app/components/AuthorImage";
import AuthorPostCard from "@/app/components/AuthorPostCard";
import SilentLink from "@/app/components/SilentLink";

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
  const { slug } = await params;
  const author = await getAuthorWithTranslation(slug, locale);
  if (!author) {
    return <div className="mx-auto max-w-3xl px-4 py-12">Author not found</div>;
  }
  const items = await getPostsByAuthorWithTags(author.id, locale);
  return (
    <main className="flex flex-col">
      <div className="max-w-7xl mx-auto">             
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{author.name}</h2>
        <div className="flex flex-row items-start gap-8 w-full py-4">
            <AuthorImage src={author.avatarUrl} alt={author.name} className="w-1/3" />
          <div className="flex flex-col justify-center flex-1">
            {author.bio ? (
              <p className="text-text-gray mb-3 leading-relaxed max-w-2xl">{author.bio}</p>
            ) : null}
            <div className="flex flex-wrap gap-4 mt-2">
              {author.websiteUrl && (
                <SilentLink
                  href={author.websiteUrl.startsWith('http') ? author.websiteUrl : `https://${author.websiteUrl}`}
                  ariaLabel="Website"
                  className="underline text-blue-600 hover:text-blue-800"
                >Website</SilentLink>
              )}
              {author.linkedinUrl && (
                <SilentLink
                  href={author.linkedinUrl.startsWith('http') ? author.linkedinUrl : `https://${author.linkedinUrl}`}
                  ariaLabel="LinkedIn"
                  className="underline text-blue-600 hover:text-blue-800"
                >LinkedIn</SilentLink>
              )}
              {author.githubUrl && (
                <SilentLink
                  href={author.githubUrl.startsWith('http') ? author.githubUrl : `https://${author.githubUrl}`}
                  ariaLabel="GitHub"
                  className="underline text-blue-600 hover:text-blue-800"
                >GitHub</SilentLink>
              )}
              {author.xUrl && (
                <SilentLink
                  href={author.xUrl.startsWith('http') ? author.xUrl : `https://${author.xUrl}`}
                  ariaLabel="X"
                  className="underline text-blue-600 hover:text-blue-800"
                >X</SilentLink>
              )}
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">Posts by {author.name}</h2>
        {items.length === 0 ? (
          <p className="text-text-gray">No posts yet.</p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            
            {items.map((p) => (
              <AuthorPostCard
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
                  tags: p.tags,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
