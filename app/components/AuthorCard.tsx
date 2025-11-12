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
    
    <SilentLink
      href={`/writers/${author.slug}`}
      aria-label={author.name}
      stopPropagation
      className="bg-surface group border border-magenta/40 hover:border-magenta rounded-lg shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-all flex flex-col shadow-lg"
    >
      {/* Image con efecto zoom al hover */}
      <div className="w-full aspect-video bg-surface relative overflow-hidden">
        <AuthorImage src={author.avatarUrl} alt={author.name} className="w-full h-full object-cover object-top rounded-t-lg transition-transform duration-300 group-hover:scale-[1.2]" />
      </div>
      <div className="flex flex-col px-4 pt-4 pb-3 gap-2 flex-1">
        <div className="flex items-center justify-between mb-1 w-full">
          <span className="font-semibold text-2xl transition-colors truncate link-effect-from-text">{author.name}</span>
          <span className="flex items-center gap-1 text-lg text-text-gray group-hover:text-magenta">
            <Icon icon="tabler:notes" className="h-4.5 w-4.5"/> {author.count} {author.count === 1 ? 'article' : 'articles'}
          </span>
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
            href={author.websiteUrl}
            ariaLabel="Website"
            stopPropagation
            className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover flex items-center gap-1"
            target="_blank"
          >
            <Icon icon="tabler:link" className="h-4.5 w-4.5 inline-block" /> Website
          </SilentLink>
        )}
        {author.linkedinUrl && (
          <SilentLink
            href={author.linkedinUrl}
            ariaLabel="LinkedIn"
            stopPropagation
            className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover flex items-center gap-1"
            target="_blank"
          >
            <Icon icon="tabler:brand-linkedin" className="h-4.5 w-4.5 inline-block" /> LinkedIn
          </SilentLink>
        )}
        {author.githubUrl && (
          <SilentLink
            href={author.githubUrl}
            ariaLabel="GitHub"
            stopPropagation
            className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover flex items-center gap-1"
            target="_blank"
          >
            <Icon icon="tabler:brand-github" className="h-4.5 w-4.5 inline-block" /> GitHub
          </SilentLink>
        )}
        {author.xUrl && (
          <SilentLink
            href={author.xUrl}
            ariaLabel="X"
            stopPropagation
            className="px-2 py-1 border border-magenta rounded-lg btn-fill-hover flex items-center gap-1"
            target="_blank"
          >
            <Icon icon="tabler:brand-x" className="h-4.5 w-4.5 inline-block" /> Twitter
          </SilentLink>
        )}
      </div>
    </SilentLink>
  );
}
