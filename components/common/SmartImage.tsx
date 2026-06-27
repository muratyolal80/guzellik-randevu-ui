/**
 * SmartImage — next/image wrapper.
 * Avantaj: lazy loading, responsive srcset, fallback, error handling.
 * `<img>` yerine kullanın — drop-in replacement.
 */
'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

type Props = Omit<ImageProps, 'src' | 'alt' | 'onError'> & {
  src: string | null | undefined;
  alt: string;
  fallback?: string;
};

const DEFAULT_FALLBACK = '/placeholder-salon.jpg';

export function SmartImage({ src, alt, fallback = DEFAULT_FALLBACK, fill, ...rest }: Props) {
  const [errored, setErrored] = useState(false);
  const finalSrc = errored || !src ? fallback : src;

  // fill modunda width/height verilmemeli
  if (fill) {
    return (
      <Image
        src={finalSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        onError={() => setErrored(true)}
        {...rest}
      />
    );
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={(rest as any).width || 400}
      height={(rest as any).height || 300}
      onError={() => setErrored(true)}
      {...rest}
    />
  );
}
