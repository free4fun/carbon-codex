"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
};

export default function CategoryImage({ src, alt, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src || "/categories/generic.webp");
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc("/categories/generic.webp");
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
