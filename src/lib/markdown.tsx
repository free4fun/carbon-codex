import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import { ExternalLink, LucideSquareArrowLeft } from "lucide-react";

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className }: Props) {
  const isExternalLink = (href?: string) => {
    if (!href) return false;
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex as any,
          rehypeSlug as any,
        ]}
        components={{
          a: (props) => {
            const isExternal = isExternalLink(props.href);
            return (
              <span className="link-effect-from-magenta inline-block align-baseline">
                <a
                  {...props}
                  className="underline underline-offset-2 hover:no-underline inline-block align-baseline"
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  style={{ color: 'inherit' }}
                >
                  {props.children}
                  {isExternal ? (
                    <ExternalLink className="inline-block w-3.5 h-3.5 ml-0.5 align-baseline" style={{ color: 'inherit' }} />
                  ) : (
                    <LucideSquareArrowLeft className="inline-block w-3.5 h-3.5 ml-0.5 align-baseline" style={{ color: 'inherit' }} />
                  )}
                </a>
              </span>
            );
          },
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt || ""} className="max-w-full h-auto" />
          ),
          h1: (props) => <h1 {...props} className="mt-8 mb-4 text-3xl font-semibold" />,
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
