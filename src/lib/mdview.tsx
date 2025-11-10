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
            <a {...props} className="text-cyan underline underline-offset-2 hover:no-underline" />
          ),
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt || ""} className="max-w-2xl w-full h-auto rounded my-6 mx-auto" />
          ),
          h1: (props) => <h1 {...props} className="mt-8 mb-4 text-3xl font-bold" />,
          h2: (props) => <h2 {...props} className="mt-8 mb-4 text-2xl font-semibold border-b border-cyan/20 pb-2" />,
          h3: (props) => <h3 {...props} className="mt-6 mb-3 text-xl font-semibold" />,
          h4: (props) => <h4 {...props} className="mt-4 mb-2 text-lg font-semibold" />,
          h5: (props) => <h5 {...props} className="mt-4 mb-2 text-base font-semibold" />,
          h6: (props) => <h6 {...props} className="mt-4 mb-2 text-sm font-semibold text-text-gray" />,
          p: (props) => <p {...props} className="my-4 leading-relaxed" />,
          ul: (props) => <ul {...props} className="my-4 ml-6 list-disc space-y-2" />,
          ol: (props) => <ol {...props} className="my-4 ml-6 list-decimal space-y-2" />,
          li: (props) => <li {...props} className="leading-relaxed" />,
          blockquote: (props) => (
            <blockquote {...props} className="my-4 border-l-4 border-cyan pl-4 italic text-text-gray" />
          ),
          table: (props) => (
            <div className="my-6 overflow-x-auto">
              <table {...props} className="min-w-full border-collapse border border-cyan/30" />
            </div>
          ),
          thead: (props) => <thead {...props} className="bg-[var(--surface)]" />,
          th: (props) => <th {...props} className="border border-cyan/30 px-4 py-2 text-left font-semibold" />,
          td: (props) => <td {...props} className="border border-cyan/30 px-4 py-2" />,
          hr: (props) => <hr {...props} className="my-8 border-t border-cyan/30" />,
          code: ({ inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code {...props} className="rounded bg-[var(--surface)] px-1.5 py-0.5 text-sm font-mono text-cyan">
                  {children}
                </code>
              );
            }
            return (
              <code {...props} className={`${className || ""} text-sm`}>
                {children}
              </code>
            );
          },
          pre: (props) => (
            <pre {...props} className="my-6 rounded bg-[var(--surface)] p-4 overflow-x-auto border border-cyan/20" />
          ),
          input: (props) => {
            if (props.type === "checkbox") {
              return (
                <input
                  {...props}
                  className="mr-2 accent-cyan"
                  disabled={props.disabled || props.checked !== undefined}
                />
              );
            }
            return <input {...props} />;
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
