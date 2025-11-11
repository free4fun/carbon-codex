"use client";

import { useRouter } from "next/navigation";

export type Author = {
  slug: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  websiteUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  xUrl: string | null;
  count: number;
};

function normalizeUrl(url?: string | null) {
  if (!url) return url ?? undefined;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export default function AuthorCard({ author }: { author: Author }) {
  const router = useRouter();
  const go = () => router.push(`/authors/${author.slug}`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  const bio = author.bio
    ? author.bio.slice(0, 150) + (author.bio.length > 150 ? "…" : "")
    : null;

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={author.name}
      onClick={go}
      onKeyDown={onKey}
      className="cursor-pointer group p-5 bg-surface/50 border border-violet/20 rounded-lg hover:border-magenta transition-all flex flex-col gap-4"
    >
      <div className="flex items-center gap-4">
        <span className="relative inline-block h-14 w-14 rounded-full overflow-hidden bg-surface border">
          {author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatarUrl} alt={author.name} className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/carboncodex.svg" alt={author.name} className="p-2" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold group-hover:text-magenta transition-colors truncate">{author.name}</div>
          <div className="text-xs text-violet">{author.count} articles</div>
        </div>
      </div>
      {bio && (
        <p className="text-xs text-text-gray leading-relaxed line-clamp-4">{bio}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-1 text-[11px]">
        {author.websiteUrl && (
          <a
            href={normalizeUrl(author.websiteUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
          >
            Website
          </a>
        )}
        {author.linkedinUrl && (
          <a
            href={normalizeUrl(author.linkedinUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
          >
            LinkedIn
          </a>
        )}
        {author.githubUrl && (
          <a
            href={normalizeUrl(author.githubUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
          >
            GitHub
          </a>
        )}
        {author.xUrl && (
          <a
            href={normalizeUrl(author.xUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-surface border rounded-md group-hover:border-magenta transition-colors hover:text-magenta"
          >
            X
          </a>
        )}
      </div>
    </div>
  );
}
