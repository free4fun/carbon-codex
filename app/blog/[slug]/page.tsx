import { getPostBySlug, getRelatedByTag } from "@/src/lib/blog";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Markdown } from "@/src/lib/markdown";
import SilentLink from "@/app/components/SilentLink";
import TagList from "@/app/components/TagList";
import { Clock } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };
type Locale = "en" | "es";

export const revalidate = 60;

function formatDate(date: Date, locale: string): string {
   try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    // Fallback simple si Intl falla por alguna razón
    return date.toISOString().slice(0, 10);
  }
}

export default async function BlogDetail({ params }: Props) {
 const headersList = await headers();
  const locale = (headersList.get('x-locale') as Locale) || 'en';
  const t = locale === "en" ? en : es;
  const { slug } = await params;
  
  
  const data = await getPostBySlug(slug, locale);
  if (!data) {
    return <div className="mx-auto max-w-3xl px-4 py-12">Not found</div>;
  }

  const related =
    data.tags?.[0]?.slug
        ? await getRelatedByTag(slug, locale, data.tags[0].slug)
      : [];

  return (
    <main className="flex flex-col">
      <section className="w-full flex items-center mt-6 px-6">
        <div className="max-w-7xl mx-auto ">
          <div className="flex items-center justify-between mb-2">
            {/* Title */}
            <h1 className="text-3xl text-white md:text-4xl font-bold leading-tight flex-1">{data.post.title}</h1>
            {/* Author info */}
            {data.author?.name && (
              <SilentLink
                href={`/authors/${data.author.slug}`}
                ariaLabel={data.author.name}
                stopPropagation
                className="flex items-center gap-2 link-effect-from-text"
              >
                <span className="inline-block">
                  <img
                    src={data.author.avatarUrl || "/authors/generic.webp"}
                    alt={data.author.name}
                    className="w-13 h-13 rounded-full object-cover border border-magenta/40 border-"
                  />
                </span>
                <span className="text-lg">{data.author.name}</span>
              </SilentLink>
            )}
          </div>
          {/* Tags */}
          {data.tags?.length ? (
            <div className="mb-2">
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <SilentLink
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    ariaLabel={tag.name}
                    stopPropagation
                    className="text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded hover:bg-surface-magenta border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
                  >
                    {tag.name}
                  </SilentLink>
                ))}
              </div>
            </div>
          ) : null}
          {/* Description */}
          {data.post.description && (
            <p className="text-sm mb-3 md:text-lg">{data.post.description}</p>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col gap-1">
              {/* Category */}
              {data.category?.name && (
                <SilentLink
                  href={`/categories/${data.category.slug}`}
                  ariaLabel={data.category.name}
                  stopPropagation
                  className="link-effect-from-magenta uppercase tracking-wide font-semibold"
                >
                  {data.category.name}
                </SilentLink>
              )}
              {/* Date */ }
              {data.post.publishedAt ? (
                <span className="text-sm text-white">{formatDate(new Date(data.post.publishedAt), data.post.locale)}</span>
              ) : null}
            </div>
            {/* Read minutes */}
            {data.post.readMinutes ? (
              <span className="flex items-center gap-1 text-sm text-white whitespace-nowrap ml-4">
                <Clock className="w-4 h-4" />
                {data.post.readMinutes} min
              </span>
            ) : null}
          </div>
        </div>
      </section>
      <section className="w-full flex items-center mb-4 mt-0 pt-0">
        <div className="max-w-4xl mx-auto w-full">
          <article className="prose prose-invert max-w-none">
            <Markdown>{data.post.bodyMd}</Markdown>
          </article>
          {related.length ? (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Related</h2>
              <ul className="grid gap-3">
                {related.map((r: any) => (
                  <li key={r.slug}>
                    <a
                      className="underline underline-offset-2"
                      href={`/blog/${r.slug}`}
                    >
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
