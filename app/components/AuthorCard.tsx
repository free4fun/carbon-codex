"use client";
import AuthorImage from "./AuthorImage";
import { useRouter } from "next/navigation";
import { Icon } from '@iconify/react';
import SilentLink from "./SilentLink";

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
  const go = () => router.push(`/writers/${author.slug}`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={author.name}
      onClick={go}
      onKeyDown={onKey}
      className="cursor-pointer group bg-surface border border-magenta/40 rounded-lg hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-all flex flex-col overflow-hidden shadow-lg"
    >
      {/* Image con efecto zoom al hover */}
      <div className="w-full aspect-video bg-surface relative overflow-hidden">
        <AuthorImage src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover object-top rounded-t-lg transition-transform duration-300 group-hover:scale-[1.2]" />
      </div>
      <div className="flex flex-col px-4 pt-4 pb-3 gap-2 flex-1">
        <div className="flex items-center justify-between mb-1 w-full">
          <span className="font-semibold text-2xl transition-colors truncate link-effect-from-text">{author.name}</span>
          <span className="text-lg text-text-gray group-hover:text-magenta flex items-center gap-1"><Icon icon="tabler:bookmarks" className="h-4.5 w-4.5 inline-block"/> {author.count} {author.count === 1 ? 'article' : 'articles'}</span>
        </div>
        {author.bio && (
          <p className="text-md text-white leading-relaxed line-clamp-4 text-left">{author.bio}</p>
        )}
      </div>
      {/* Social Links */}
      <div className="flex flex-wrap justify-center gap-2 px-4 pb-4 text-xs">
        {/* Solo SilentLink, sin duplicados */}
        {author.websiteUrl && (
          <SilentLink
            href={normalizeUrl(author.websiteUrl) ?? "#"}
            ariaLabel="Website"
            stopPropagation
            className="px-2 py-1 bg-surface border border-magenta  rounded-lg btn-fill-hover flex items-center gap-1"
            onNavigate={() => window.open(normalizeUrl(author.websiteUrl), "_blank")}
          >
            <Icon icon="tabler:link" className="h-4.5 w-4.5 inline-block" /> Website
          </SilentLink>
        )}
        {author.linkedinUrl && (
          <SilentLink
            href={normalizeUrl(author.linkedinUrl) ?? "#"}
            ariaLabel="LinkedIn"
            stopPropagation
            className="px-2 py-1 bg-surface border border-magenta  rounded-lg btn-fill-hover flex items-center gap-1"
            onNavigate={() => window.open(normalizeUrl(author.linkedinUrl), "_blank")}
          >
            <Icon icon="tabler:brand-linkedin" className="h-4.5 w-4.5 inline-block" /> LinkedIn
          </SilentLink>
        )}
        {author.githubUrl && (
          <SilentLink
            href={normalizeUrl(author.githubUrl) ?? "#"}
            ariaLabel="GitHub"
            stopPropagation
            className="px-2 py-1 bg-surface border border-magenta  rounded-lg btn-fill-hover flex items-center gap-1"
            onNavigate={() => window.open(normalizeUrl(author.githubUrl), "_blank")}
          >
            <Icon icon="tabler:brand-github" className="h-4.5 w-4.5 inline-block" /> GitHub
          </SilentLink>
        )}
        {author.xUrl && (
          <SilentLink
            href={normalizeUrl(author.xUrl) ?? "#"}
            ariaLabel="X"
            stopPropagation
            className="px-2 py-1 bg-surface border border-magenta  rounded-lg btn-fill-hover flex items-center gap-1"
            onNavigate={() => window.open(normalizeUrl(author.xUrl), "_blank")}
          >
            <Icon icon="tabler:brand-x" className="h-4.5 w-4.5 inline-block" /> Twitter
          </SilentLink>
        )}
      </div>
    </div>
  );
}
