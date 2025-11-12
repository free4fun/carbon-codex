import { getPostBySlug, getRelatedByTag } from "@/src/lib/blog";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Markdown } from "@/src/lib/markdown";
import SilentLink from "@/app/components/SilentLink";
import { Icon } from '@iconify/react';

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
    redirect("/categories");
  }
  const related =
    data.tags?.[0]?.slug
      ? await getRelatedByTag(slug, locale, data.tags[0].slug)
      : [];

  return (
    <main className="flex flex-col">
      <section className="w-full mb-6 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <div className="w-full md:col-span-2">
              <h2 className="text-2xl md:text-4xl font-bold mb-3">{data.post.title}</h2>
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
                        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded hover:bg-surface-magenta border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
                      >
                        <Icon icon="tabler:tags" className="w-4.5 h-4.5" />
                        {tag.name}
                      </SilentLink>
                    ))}
                  </div>
                </div>
              ) : null}
              {/* Description */}
              {data.post.description && (
                <p className="text-text-gray md:text-md mb-3 w-full leading-relaxed">{data.post.description}</p>
              )}
              <div className="flex flex-col gap-2 mb-6">
                {/* Category */}
                {data.category?.name && (
                  <SilentLink
                    href={`/categories/${data.category.slug}`}
                    ariaLabel={data.category.name}
                    stopPropagation
                    className="flex items-center gap-1 text-text-gray hover:text-magenta uppercase tracking-wide font-semibold text-sm"
                  >
                    <Icon icon="tabler:bookmarks" className="w-4.5 h-4.5" />
                    {data.category.name}
                  </SilentLink>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end mt-8 md:mr-20">
              {data.author?.name && (
                <SilentLink
                  href={`/authors/${data.author.slug}`}
                  ariaLabel={data.author.name}
                  stopPropagation
                  className="flex flex-col items-center link-effect-from-text"
                >
                  <span className="inline-block">
                    <img
                      src={data.author.avatarUrl || "/authors/generic.webp"}
                      alt={data.author.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </span>
                  <span className="text-text-gray hover:text-magenta text-sm font-semibold">{data.author.name}</span>
                </SilentLink>
              )}
              <div className="flex flex-row items-center gap-4 mt-2">
                {data.post.publishedAt && (
                  <span className="flex items-end gap-1 text-sm text-text-gray">
                    <Icon icon="tabler:calendar-week" className="w-4.5 h-4.5" />
                    {formatDate(new Date(data.post.publishedAt), data.post.locale)}
                  </span>
                )}
                {data.post.readMinutes && (
                  <span className="flex items-end gap-1 text-sm text-text-gray">
                    <Icon icon="tabler:clock" className="w-4.5 h-4.5" />
                    {data.post.readMinutes} min
                  </span>
                )}
              </div>
            </div>
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
