"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  className?: string;
};

export default function PostImage({ src, alt, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src || "/blog/posts/generic.webp");
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0) {
      setImgSrc("/blog/posts/generic.webp");
      setErrorCount(1);
    } else if (errorCount === 1) {
      setImgSrc("/default.webp");
      setErrorCount(2);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc || "/default.webp"}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
