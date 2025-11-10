"use client";

import DOMPurify from "isomorphic-dompurify";
import React from "react";

type Props = {
  html: string;
  className?: string;
};

// Configure a strict whitelist: only p, img, a, code, pre, ol, ul, li
const sanitize = (dirty: string) =>
  DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: ["p", "img", "a", "code", "pre", "ol", "ul", "li"],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class"],
    ADD_ATTR: ["loading"],
    RETURN_TRUSTED_TYPE: false,
  });

export function SimpleMarkup({ html, className }: Props) {
  const safe = sanitize(html || "");
  return <div className={className} dangerouslySetInnerHTML={{ __html: safe }} />;
}
