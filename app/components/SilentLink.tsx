"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, MouseEvent, ReactNode } from "react";

interface SilentLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onNavigate?: () => void; // optional callback after navigation
  stopPropagation?: boolean; // if true, stop event bubbling (for nested interactive zones)
  target?: string;
  rel?: string;
}

/**
 * SilentLink performs client-side navigation without rendering an <a> tag,
 * which suppresses showing the target URL in the browser status bar.
 * It preserves accessibility via role="link", tabIndex, and Enter/Space key handling.
 * Use sparingly: avoid for external links (anchors are better for SEO + semantics).
 */
export default function SilentLink({
  href,
  children,
  className = "",
  ariaLabel,
  onNavigate,
  stopPropagation = false,
  target,
  rel
}: SilentLinkProps) {
  const router = useRouter();

  const isExternal = href.startsWith("http://") || href.startsWith("https://");

  const handleActivate = (e: MouseEvent | KeyboardEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (isExternal && onNavigate) {
      onNavigate();
    } else if (isExternal) {
      // Let <a> handle navigation
    } else {
      router.push(href);
    }
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActivate(e);
    }
  };

  if (isExternal) {
    return (
      <a
        href={href}
        className={"cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 " + className}
        aria-label={ariaLabel}
        target={target || "_blank"}
        rel={rel || "noopener noreferrer"}
        onClick={onNavigate}
      >
        {children}
      </a>
    );
  }
  return (
    <span
      role="link"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleActivate}
      onKeyDown={handleKey}
      className={"cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta focus-visible:ring-offset-2 " + className}
    >
      {children}
    </span>
  );
}
