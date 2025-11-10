'use client';

import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";

type PostCardProps = {
  post: {
    id: number;
    title: string;
    excerpt: string;
    author: string;
    authorSlug: string;
    date: string;
    readTime: number;
    tags: string[];
  };
  locale: string;
  featured?: boolean;
  minReadText: string;
};

export default function PostCard({ post, locale, featured = false, minReadText }: PostCardProps) {
  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.location.href = `/authors/${post.authorSlug}`;
  };

  if (featured) {
    return (
      <div className="lg:row-span-3 lg:row-start-1 bg-surface border border-violet/20 rounded-lg overflow-hidden group hover:border-magenta transition-all">
        <Link href={`/blog/${post.id}`} className="group block">
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-lg bg-surface aspect-[16/9] mb-3 md:mb-4">
              <Image 
                src="/blog/posts/generic.webp"
                alt={post.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <span className="absolute top-3 right-3 md:top-4 md:right-4 bg-background/80 backdrop-blur-sm px-2 md:px-3 py-1 rounded text-xs md:text-sm text-text-gray z-10 inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden="true" />
                {post.readTime} {minReadText}
              </span>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex items-center text-xs md:text-sm text-text-gray mb-2 md:mb-3">
                <span>{post.date}</span>
                <span className="ml-auto inline-flex items-center gap-1.5">
                  <button
                    onClick={handleAuthorClick}
                    className="inline-flex items-center gap-1.5 hover:text-magenta transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />{post.author}
                  </button>
                </span>
              </div>
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 group-hover:text-magenta transition-colors">
                {post.title}
              </h3>
              <p className="text-sm md:text-base text-text-gray mb-3 md:mb-4">{post.excerpt}</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 md:px-3 py-1 rounded-full border border-violet/30 text-text-gray">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // Regular compact card
  return (
    <article>
      <div className="bg-surface border border-violet/20 rounded-lg overflow-hidden group hover:border-magenta transition-all">
        <Link href={`/blog/${post.id}`} className="group block">
          <div className="flex gap-3 md:gap-4">
          <div className="relative w-40 md:w-56 overflow-hidden rounded-lg bg-surface aspect-[16/9] shrink-0">
            <Image 
              src="/blog/posts/generic.webp"
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-background/80 backdrop-blur-sm px-1.5 md:px-2 py-0.5 rounded text-xs text-text-gray z-10 inline-flex items-center gap-1">
              <Clock className="h-3 w-3 md:h-3.5 md:w-3.5" aria-hidden="true" /> {post.readTime} {minReadText}
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-between min-h-0">
            <div>
              <div className="flex items-center text-xs text-text-gray mb-1.5 md:mb-2">
                <span className="hidden sm:inline">{post.date}</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 ml-auto">
                  <button
                    onClick={handleAuthorClick}
                    className="inline-flex items-center gap-1.5 hover:text-magenta transition-colors cursor-pointer bg-transparent border-none p-0"
                  >
                    <User className="h-3.5 w-3.5" aria-hidden="true" />{post.author}
                  </button>
                </span>
              </div>
              <h3 className="text-sm md:text-base lg:text-lg font-bold mb-1.5 md:mb-2 group-hover:text-magenta transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-xs md:text-sm text-text-gray line-clamp-2 hidden sm:block">{post.excerpt}</p>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-violet/30 text-text-gray">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
      </div>
    </article>
  );
}