"use client";

import { useState } from "react";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

export default function AuthorImage({ src, alt, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src || "/authors/generic.webp");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc("/authors/generic.webp");
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
    />
  );
}
