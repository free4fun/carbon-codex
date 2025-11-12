"use client";

import SilentLink from "./SilentLink";
import PostImage from "./PostImage";
import { useRouter } from "next/navigation";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Icon } from '@iconify/react';
import { Clock, User } from "lucide-react";

type Props = {
  post: {
    slug: string;
    title: string;
    description: string | null;
    locale: string;
    coverUrl: string | null;
    readMinutes?: number | null;
    author: { slug: string | null; name: string | null; avatarUrl?: string | null };
    category: { slug: string | null; name: string | null; imageUrl?: string | null };
    publishedAt: Date | null;
    tags?: { slug: string; name: string }[];
  };
};

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

export default function PostCard({ post }: Props) {
  const t = post.locale === "es" ? es : en;
  const router = useRouter();
  const goToPost = () => router.push(`/blog/${post.slug}`);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToPost();
    }
  };
  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={post.title}
      onClick={goToPost}
      onKeyDown={onKey}
      className="cursor-pointer border border-magenta/40 rounded-lg overflow-hidden bg-surface hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-all group flex flex-col md:flex-row"
    >
      {/* Image */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="block relative flex-shrink-0">
          <div className="relative w-full aspect-video overflow-hidden">
            <PostImage
              src={post.coverUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 will-change-transform origin-center group-hover:scale-[1.2]"
            />
            
          </div>
          {/* Reading time */}
          {post.readMinutes && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-sm flex items-center gap-1">
              <Icon icon="tabler:clock" className="w-4.5 h-4.5" />
              {post.readMinutes} {t["page.minRead"]}
            </div>
          )}
        </div>
        {/* Desktop only */}
        <div className="hidden md:flex mt-auto p-2 flex-col gap-0.5 text-sm">
          {/* Category */ }
          {post.category?.name && (
            <SilentLink
              href={`/categories/${post.category.slug}`}
              className="flex items-center gap-1 link-effect-from-text link-effect uppercase tracking-wide font-semibold text-md"
              ariaLabel={post.category.name || undefined}
              stopPropagation
            >
              <Icon icon="tabler:bookmarks" className="w-4.5 h-4.5" />
              {post.category.name}
            </SilentLink>
          )}
          <div className="flex items-center gap-1text-sm text-text-gray truncate group-hover:text-white">
            {/* Date */ }
            <Icon icon="tabler:calendar-week" className="w-4.5 h-4.5" />
            {post.publishedAt
              ? formatDate(new Date(post.publishedAt), post.locale)
              : "Draft"}
          </div>
        </div>
      </div>
      <div className="p-3 flex flex-col flex-grow">
        {/* Title */}
        <div className="block mb-1">
          <h3 className="text-sm md:text-xl font-semibold group-hover:text-magenta transition-colors">
            {post.title}
          </h3>
        </div>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 4).map((t) => (
              <SilentLink
                key={t.slug}
                href={`/tags/${t.slug}`}
                ariaLabel={t.name}
                stopPropagation
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded hover:bg-surface-magenta border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
              >
                <Icon icon="tabler:tags" className="w-4.5 h-4.5" />
                {t.name}
              </SilentLink>
            ))}
          </div>
        )}
        {/* Description */}
        {post.description && (
          <div className="block mb-2">
            <p className="text-sm text-text-gray group-hover:text-white line-clamp-2">
              {post.description}
            </p>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 text-xs pt-1">
          <div className="flex w-full justify-end">
            {post.author?.name && (
              <SilentLink 
                href={`/authors/${post.author.slug}`} 
                className="flex items-center gap-1.5 link-effect-from-text text-lg"
                ariaLabel={post.author.name || undefined}
                stopPropagation
              >
                <Icon icon="tabler:user" className="w-4.5 h-4.5" />
                {post.author.name}
              </SilentLink>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
