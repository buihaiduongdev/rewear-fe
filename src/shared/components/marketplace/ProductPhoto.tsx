'use client';

import { useState } from 'react';

import Image from 'next/image';

import { ImageOff } from 'lucide-react';

export function ProductPhoto({
  url,
  title,
  sizes = '(min-width: 1280px) 278px, (min-width: 768px) 23vw, 45vw',
}: {
  url: string | null;
  title: string | null;
  sizes?: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();

  if (!url || failedUrl === url) {
    return (
      <div
        className="bg-rewear-soft text-rewear-muted flex h-full items-center justify-center"
        role="img"
        aria-label={`Photo unavailable for ${title ?? 'this piece'}`}
      >
        <ImageOff size={24} strokeWidth={1.25} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={title ?? 'Pre-owned clothing'}
      fill
      sizes={sizes}
      unoptimized
      className="object-cover"
      onError={() => setFailedUrl(url)}
    />
  );
}
