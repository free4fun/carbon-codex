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
    return `${day} de ${monthsES[month]} de ${year}`;
  } else {
    return `${monthsEN[month]} ${day}, ${year}`;
  }
}

export default function FeaturedPostCard({ post }: Props) {
  return (
    <article className="border border-cyan/20 rounded-lg overflow-hidden bg-background hover:border-magenta transition-all group h-full flex flex-col">
      <Link href={`/blog/${post.slug}`} className="block relative flex-shrink-0">
        {/* 16:9 aspect ratio container */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverUrl || "/carboncodex.svg"}
            alt=""
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        {post.readMinutes && (
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {post.readMinutes} min
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <Link href={`/blog/${post.slug}`} className="block mb-3 flex-grow">
          <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-cyan transition-colors">
            {post.title}
          </h3>
          {post.description && (
            <p className="text-sm text-text-gray line-clamp-2">
              {post.description}
            </p>
          )}
        </Link>

        {/* Bottom row: category/date on left, author on right */}
        <div className="flex items-center justify-between gap-3 text-xs text-text-gray/70 mt-auto">
          {/* Left: Category and Date */}
          <div className="flex flex-col gap-1 min-w-0">
            {post.category?.name && (
              <Link 
                href={`/categories/${post.category.slug}`} 
                className="hover:text-magenta transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                {post.category.name}
              </Link>
            )}
            <div className="text-text-gray/50">
              {post.publishedAt
                ? formatDate(new Date(post.publishedAt), post.locale)
                : "Draft"}
            </div>
          </div>

          {/* Right: Author with avatar */}
          {post.author?.name && (
            <Link 
              href={`/authors/${post.author.slug}`} 
              className="flex items-center gap-1.5 hover:text-magenta transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.author.avatarUrl || "/carboncodex.svg"} alt="" className="w-6 h-6 rounded-full object-cover border" />
              <span>{post.author.name}</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
