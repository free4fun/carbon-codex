import { getAuthorsWithCounts } from "@/src/lib/blog";
import { headers } from "next/headers";
import AuthorCard from "@/app/components/AuthorCard";

export const revalidate = 60;

export default async function AuthorsIndex() {
  const headersList = await headers();
  const locale = (headersList.get("x-locale") as string) || "en";
  const authors = await getAuthorsWithCounts(locale);

  return (
     <main className="flex flex-col">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">Writers</h2>
          <p className="text-sm md:text-lg lg:text-xl text-text-gray leading-relaxed mb-6 md:mb-8">Meet the talented writers contributing to our blog</p>
          {authors.length === 0 ? (
            <p className="text-text-gray">No writers found.</p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {authors.map((author) => (
                <AuthorCard key={author.slug} author={author} />
              ))}
            </div>
          )}
      </div>
      </main>
  );
}
