"use client";
import AuthorCard from "@/app/components/AuthorCard";
import SilentLink from "@/app/components/SilentLink";

export default function AuthorClientView({ author }: { author: any }) {
  return (
    <div className="mb-8">
      <AuthorCard author={author} />
      <div className="mt-4 flex gap-4">
        {author.website && (
          <SilentLink href={author.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Website
          </SilentLink>
        )}
        {author.twitter && (
          <SilentLink href={author.twitter} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Twitter
          </SilentLink>
        )}
      </div>
    </div>
  );
}