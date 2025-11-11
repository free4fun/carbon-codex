"use client";

import SilentLink from "./SilentLink";
import PostImage from "./PostImage";
import AuthorImage from "./AuthorImage";
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
    return `${day} de ${monthsES[month]} de ${year}`;
  } else {
    return `${monthsEN[month]} ${day}, ${year}`;
  }
}

export default function FeaturedPostCard({ post }: Props) {
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
      className="cursor-pointer border border-magenta/40 rounded-lg overflow-hidden bg-background hover:border-magenta shadow-[0_2px_10px_-2px_rgba(var(--magenta-rgb),0.18),0_1px_3px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_20px_-2px_rgba(var(--magenta-rgb),0.35),0_2px_8px_rgba(0,0,0,0.2)] transition-all group h-full flex flex-col"
    >
      <div className="block relative flex-shrink-0">
        {/* 16:9 aspect ratio container */}
        <div className="relative w-full aspect-video overflow-hidden">
          <PostImage
            src={post.coverUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 will-change-transform origin-center group-hover:scale-[1.2]"
          />
          
        </div>
        {post.readMinutes && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-sm text-white flex items-center gap-1">
            <Clock size={14} className="inline-block" />
            {post.readMinutes} {t["page.minRead"]}
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="block mb-3 flex-grow">
          <h3 className="text-xl md:text-3xl font-semibold mb-2 line-clamp-2 group-hover:text-magenta transition-colors">
            {post.title}
          </h3>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.slice(0, 4).map((t) => (
                <SilentLink
                  key={t.slug}
                  href={`/tags/${t.slug}`}
                  ariaLabel={t.name}
                  stopPropagation
                  className="text-xs font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded hover:bg-surface-magenta border border-magenta/30 hover:border-magenta hover:text-magenta transition-colors"
                >
                  {t.name}
                </SilentLink>
              ))}
            </div>
          )}
          {/* Description */}
          {post.description && (
            <p className="text-sm md:text-lg group-hover:text-white text-text-gray line-clamp-2">
              {post.description}
            </p>
          )}
        </div>

        {/* Bottom row: category/date on left, author on right */}
        <div className="flex items-center justify-between gap-3 text-xs mt-auto">
          {/* Left: Category and Date */}
          <div className="flex flex-col gap-1 min-w-0">
            {post.category?.name && (
              <SilentLink 
                href={`/categories/${post.category.slug}`} 
                className="text-base hover:!text-magenta transition-colors uppercase tracking-wide font-semibold"
                ariaLabel={post.category.name || undefined}
                stopPropagation
              >
                {post.category.name}
              </SilentLink>
            )}
            <div className="text-sm group-hover:text-white text-text-gray">
              {post.publishedAt
                ? formatDate(new Date(post.publishedAt), post.locale)
                : "Draft"}
            </div>
          </div>

          {/* Right: Author with avatar */}
          {post.author?.name && (
            <SilentLink 
              href={`/authors/${post.author.slug}`} 
              className="text-sm flex items-center gap-1.5 text-text-gray hover:!text-magenta group-hover:text-white transition-colors flex-shrink-0"
              ariaLabel={post.author.name || undefined}
              stopPropagation
            >
              <AuthorImage src={post.author.avatarUrl} alt={post.author.name || ""} className="w-6 h-6 rounded-full object-cover border" />
              <span>{post.author.name}</span>
            </SilentLink>
          )}
        </div>
      </div>
    </article>
  );
}
