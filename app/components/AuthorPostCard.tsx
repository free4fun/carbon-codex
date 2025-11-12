"use client";

import SilentLink from "./SilentLink";
import PostImage from "./PostImage";
import { useRouter } from "next/navigation";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Icon } from '@iconify/react';

type Props = {
  post: {
    slug: string;
    title: string;
    description: string | null;
    locale: string;
    coverUrl: string | null;
    readMinutes?: number | null;
    author: { slug: string | null; name: string | null; avatarUrl?: string | null };
    category: { slug: string | null; name: string | null; imageUrl?: string | null } | null;
    publishedAt: Date | null;
    tags?: { slug: string; name: string }[];
  };
};

function formatDate(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export default function AuthorPostCard({ post }: Props) {
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
      className="group cursor-pointer rounded-lg overflow-hidden border border-magenta/40 bg-background hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_22px_-4px_rgba(var(--magenta-rgb),0.35),0_3px_10px_rgba(0,0,0,0.18)] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta/70"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <PostImage
          src={post.coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transform-gpu transition-transform duration-300 will-change-transform group-hover:scale-[1.2]"
        />

        {/* Read time badge */}
        {post.readMinutes ? (
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-sm px-1.5 py-0.5 rounded flex items-center gap-1">
            <Icon icon="mdi:clock-outline" className="w-4.5 h-4.5" />
            {post.readMinutes} {t["page.minRead"]}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        {/* Title */}
        <h3 className="text-sm md:text-xl font-semibold group-hover:text-magenta transition-colors line-clamp-1">
          {post.title}
        </h3>
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 4).map((t) => (
              <SilentLink
                key={t.slug}
                href={`/tags/${t.slug}`}
                ariaLabel={t.name}
                stopPropagation
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded hover:bg-surface-magenta border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
              ><Icon icon="tabler:tags" className="w-4.5 h-4.5" />
                {t.name}
              </SilentLink>
            ))}
          </div>
        )}

        {/* Description */}
        {post.description && (
          <p className="text-sm md:text-lg text-text-gray line-clamp-2 group-hover:text-white">{post.description}</p>
        )}

        <div className="mt-auto flex flex-row items-end justify-between gap-3 text-xs">
          <div className="flex flex-col items-start gap-1 text-sm text-text-gray group-hover:text-white flex-grow">
            {/* Category */}
            {post.category && post.category.slug && post.category.name ? (
              <SilentLink 
                href={`/categories/${post.category.slug}`} 
                className="flex items-center gap-1 link-effect-from-magenta uppercase tracking-wide font-semibold text-md"
                ariaLabel={post.category.name}
                stopPropagation
              >
                <Icon icon="tabler:bookmarks" className="w-4.5 h-4.5" />
                {post.category.name}
              </SilentLink>
            ) : (
              <span className="uppercase tracking-wide font-semibold text-lg text-text-gray/60">No category</span>
            )}
            {/* Date below category */}
            <div className="flex items-center gap-1 mt-0.5">
              <Icon icon="tabler:calendar-week" className="w-4.5 h-4.5" />
              {post.publishedAt ? formatDate(new Date(post.publishedAt), post.locale) : "Draft"}
            </div>
          </div>
          <div className="text-text-gray group-hover:text-white hover:!text-magenta flex-shrink-0 self-end">
           {/* Author */}
           {post.author?.name ? (
            <SilentLink
              href={`/authors/${post.author.slug}`}
              ariaLabel={post.author.name || undefined}
              stopPropagation
              className="text-sm link-effect-from-text flex items-center gap-2"
            >
              <Icon icon="tabler:user" className="w-4.5 h-4.5" />
              <span>{post.author.name}</span>
            </SilentLink>
          ) : <span/>}
        </div>
        </div>
      </div>
    </article>
  );
}
