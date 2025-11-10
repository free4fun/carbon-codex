import { getPostBySlug, getRelatedByTag } from "@/src/lib/blog";
import { headers } from "next/headers";
import { Markdown } from "@/src/lib/markdown";
import TagList from "@/src/components/TagList";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export default async function BlogDetail({ params }: Props) {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-4">
        <div className="text-sm text-text-gray">
          {data.category?.name || "—"}
        </div>
      </div>
      <h1 className="text-3xl font-bold mb-2">{data.post.title}</h1>
      <div className="text-sm text-text-gray mb-6">
        {data.post.readMinutes ? `${data.post.readMinutes} min` : null}
        {data.post.publishedAt ? ` • ${new Date(data.post.publishedAt).toLocaleDateString()}` : ""}
        {data.fallback ? " • fallback from EN" : ""}
      </div>
      <article className="prose prose-invert max-w-none">
        <Markdown>{data.post.bodyMd}</Markdown>
      </article>

      {data.tags?.length ? (
        <div className="mt-8">
          <TagList tags={data.tags} locale={locale} />
        </div>
      ) : null}

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
  );
}
