"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  fallback?: string;
};

export default function PostImage({ src, alt, className, fallback = "/blog/posts/generic.webp" }: Props) {
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
