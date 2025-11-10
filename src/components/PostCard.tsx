"use client";

import Link from "next/link";

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
  return (
    <article className="border border-cyan/20 rounded-lg overflow-hidden bg-background hover:border-magenta transition-all group flex flex-row">
      {/* Left column: Image + Category/Date at bottom */}
      <div className="w-48 flex-shrink-0 flex flex-col">
        <Link href={`/blog/${post.slug}`} className="block relative flex-shrink-0">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverUrl || "/carboncodex.svg"}
              alt=""
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {/* Reading time badge on image - top right */}
          {post.readMinutes && (
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs text-white flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {post.readMinutes}m
            </div>
          )}
        </Link>
        
        {/* Category and Date at bottom of card */}
        <div className="mt-auto p-2 flex flex-col gap-0.5 text-xs text-text-gray/70">
          {post.category?.name && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="hover:!text-magenta transition-colors truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {post.category.name}
            </Link>
          )}
          <div className="text-text-gray/50 truncate">
            {post.publishedAt
              ? formatDate(new Date(post.publishedAt), post.locale)
              : "Draft"}
          </div>
        </div>
      </div>
      
      {/* Content on the right */}
      <div className="p-3 flex flex-col flex-grow min-w-0">
        {/* Title - clickable */}
        <Link href={`/blog/${post.slug}`} className="block mb-1">
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-cyan transition-colors">
            {post.title}
          </h3>
        </Link>

        {/* Tags row */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 4).map((t) => (
              <Link
                key={t.slug}
                href={`/tags/${t.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-surface/40 border border-violet/30 hover:border-magenta hover:text-magenta transition-colors"
              >
                {t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Description - 3 lines */}
        {post.description && (
          <Link href={`/blog/${post.slug}`} className="block mb-2">
            <p className="text-xs text-text-gray line-clamp-3">
              {post.description}
            </p>
          </Link>
        )}

        {/* Bottom: Author with avatar */}
        <div className="mt-auto flex items-center justify-end text-xs text-text-gray/70 pt-1">
          {post.author?.name && (
            <Link
              href={`/authors/${post.author.slug}`}
              className="flex items-center gap-1.5 hover:!text-magenta transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.author.avatarUrl || "/carboncodex.svg"}
                alt=""
                className="w-5 h-5 rounded-full object-cover border"
              />
              <span>{post.author.name}</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
