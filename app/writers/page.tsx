import Link from "next/link";
import { headers } from "next/headers";
import { getAuthorsWithCounts } from "@/src/lib/blog";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";

type Locale = "en" | "es";

export const revalidate = 60;

export default async function WritersPage() {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as Locale) || "en";
  const t = locale === "en" ? en : es;
  const authors = await getAuthorsWithCounts(locale);

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
            {authors.map((a) => {
              const norm = (url: string) => {
                if (!url) return url;
                if (/^https?:\/\//i.test(url)) return url;
                return `https://${url}`;
              };
              const bio = a.bio ? a.bio.slice(0, 150) + (a.bio.length > 150 ? "…" : "") : null;
              return (
                <li key={a.slug}>
                  <div className="group p-5 bg-surface/50 border border-violet/20 rounded-lg hover:border-magenta transition-all flex flex-col gap-4">
                    <Link href={`/authors/${a.slug}`} className="flex items-center gap-4">
                      <span className="relative inline-block h-14 w-14 rounded-full overflow-hidden bg-surface border">
                        {a.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={a.avatarUrl} alt={a.name} className="h-full w-full object-cover" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src="/carboncodex.svg" alt={a.name} className="p-2" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold group-hover:text-magenta transition-colors truncate">{a.name}</div>
                        <div className="text-xs text-violet">{a.count} articles</div>
                      </div>
                    </Link>
                    {bio && (
                      <p className="text-xs text-text-gray leading-relaxed line-clamp-4">
                        {bio}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1 text-[11px]">
                      {a.websiteUrl && (
                        <a
                          href={norm(a.websiteUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
                        >
                          Website
                        </a>
                      )}
                      {a.linkedinUrl && (
                        <a
                          href={norm(a.linkedinUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
                        >
                          LinkedIn
                        </a>
                      )}
                      {a.githubUrl && (
                        <a
                          href={norm(a.githubUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
                        >
                          GitHub
                        </a>
                      )}
                      {a.xUrl && (
                        <a
                          href={norm(a.xUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
                        >
                          X
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
