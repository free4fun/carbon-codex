import { headers } from "next/headers";
import { getAuthorsWithCounts } from "@/src/lib/blog";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import AuthorCard, { Author } from "@/app/components/AuthorCard";

type Locale = "en" | "es";

export const revalidate = 60;

export default async function WritersPage() {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;
  const authorsRaw = await getAuthorsWithCounts(locale);
  const authors: Author[] = authorsRaw.map(a => ({
    slug: a.slug,
    name: a.name,
    avatarUrl: a.avatarUrl,
    bio: a.bio,
    websiteUrl: a.websiteUrl,
    linkedinUrl: a.linkedinUrl,
    githubUrl: a.githubUrl,
    xUrl: a.xUrl,
    count: a.count,
  }));

  return (
    <main className="px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan mb-6">
          {t["nav.writers"]}
        </h1>
        {authors.length === 0 ? (
          <p className="text-text-gray">No writers yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map(a => (
              <li key={a.slug}>
                <AuthorCard author={a} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
