import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex as any,
          rehypeSlug as any,
          [rehypeAutolinkHeadings as any, { behavior: "wrap" }],
        ]}
        components={{
          a: (props) => (
            <a {...props} className="underline underline-offset-2 hover:no-underline" />
          ),
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt || ""} className="max-w-full h-auto" />
          ),
          h1: (props) => <h1 {...props} className="mt-8 mb-4 text-3xl font-bold" />,
          h2: (props) => <h2 {...props} className="mt-8 mb-4 text-2xl font-semibold" />,
          h3: (props) => <h3 {...props} className="mt-6 mb-3 text-xl font-semibold" />,
          code: (props) => (
            <code {...props} className="rounded bg-[var(--surface)] px-1 py-0.5" />
          ),
          pre: (props) => (
            <pre {...props} className="rounded bg-[var(--surface)] p-4 overflow-auto" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
