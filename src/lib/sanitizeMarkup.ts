"use server";

import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

/**
 * Server-side HTML sanitizer for simple markup preview.
 * Only allows: p, img, a, code, pre, ol, ul, li
 */
export async function sanitizeMarkup(html: string): Promise<string> {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window as any);

  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["p", "img", "a", "code", "pre", "ol", "ul", "li"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ADD_ATTR: ["loading"],
  });

  return clean;
}

/**
 * Calculate estimated reading time in minutes from HTML content.
 * Averages ~200 words per minute.
 */
export async function calculateReadingTime(html: string): Promise<number> {
  // Strip HTML tags and count words
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return minutes;
}
