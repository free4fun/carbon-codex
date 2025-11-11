"use client";

import SilentLink from "./SilentLink";
import { useRouter } from "next/navigation";
import en from "@/i18n/en.json";
import es from "@/i18n/es.json";
import { Clock } from "lucide-react";

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
  const monthsES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  
  const monthsEN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  if (locale === "es") {
    // Formato: dd de mes de año
    return `${day} de ${monthsES[month]} de ${year}`;
  } else {
    // Formato: Month dd, year
    return `${monthsEN[month]} ${day}, ${year}`;
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
      className="cursor-pointer border border-magenta/40 rounded-lg overflow-hidden bg-background hover:border-magenta shadow-[0_2px_8px_-2px_rgba(var(--magenta-rgb),0.15),0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_16px_-2px_rgba(var(--magenta-rgb),0.28),0_2px_6px_rgba(0,0,0,0.15)] transition-all group flex flex-col md:flex-row"
    >
      {/* Image section - full width on mobile, left column on md+ */}
      <div className="w-full md:w-56 flex-shrink-0 flex flex-col">
        <div className="block relative flex-shrink-0">
          <div className="relative w-full aspect-video overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverUrl || "/carboncodex.svg"}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 will-change-transform origin-center group-hover:scale-[1.2]"
              loading="lazy"
            />
            
          </div>
          {/* Reading time badge on image - top right */}
          {post.readMinutes && (
            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
              <Clock size={12} className="inline-block" />
              {post.readMinutes} {t["page.minRead"]}
            </div>
          )}
        </div>
        
        {/* Desktop: category/date anchored at bottom of the left column */}
        <div className="hidden md:flex mt-auto p-2 flex-col gap-0.5 text-xs">
          {post.category?.name && (
            <SilentLink
              href={`/categories/${post.category.slug}`}
              className="hover:!text-magenta transition-colors truncate uppercase font-semibold"
              ariaLabel={post.category.name || undefined}
              stopPropagation
            >
              {post.category.name}
            </SilentLink>
          )}
          <div className="text-text-gray truncate">
            {post.publishedAt
              ? formatDate(new Date(post.publishedAt), post.locale)
              : "Draft"}
          </div>
        </div>
      </div>
      
      {/* Content section - below image on mobile, right side on md+ */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Title */}
        <div className="block mb-1">
          <h3 className="text-sm md:text-xl font-semibold group-hover:text-magenta transition-colors">
            {post.title}
          </h3>
        </div>

        {/* Tags row */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 4).map((t) => (
              <SilentLink
                key={t.slug}
                href={`/tags/${t.slug}`}
                ariaLabel={t.name}
                stopPropagation
                className="text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface/40 border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
              >
                {t.name}
              </SilentLink>
            ))}
          </div>
        )}

        {/* Description */}
        {post.description && (
          <div className="block mb-2">
            <p className="text-sm text-text-gray line-clamp-2">
              {post.description}
            </p>
          </div>
        )}

        {/* Bottom row: mobile-only category/date (left) + author (right). Desktop shows only author (category/date in left column). */}
        <div className="mt-auto flex items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-col gap-1 min-w-0 md:hidden">
            {post.category?.name && (
              <SilentLink
                href={`/categories/${post.category.slug}`}
                className="hover:!text-magenta transition-colors truncate uppercase tracking-wide font-semibold"
                ariaLabel={post.category.name || undefined}
                stopPropagation
              >
                {post.category.name}
              </SilentLink>
            )}
            <div className="text-text-gray truncate">
              {post.publishedAt
                ? formatDate(new Date(post.publishedAt), post.locale)
                : "Draft"}
            </div>
          </div>
          {post.author?.name && (
            <SilentLink 
              href={`/authors/${post.author.slug}`} 
              className="flex items-center gap-1.5 hover:!text-magenta transition-colors flex-shrink-0 md:ml-auto"
              ariaLabel={post.author.name || undefined}
              stopPropagation
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.author.avatarUrl || "/carboncodex.svg"} alt="" className="w-6 h-6 rounded-full object-cover border" />
              <span>{post.author.name}</span>
            </SilentLink>
          )}
        </div>
      </div>
    </article>
  );
}
