import Image from 'next/image';

import { cn } from 'cn';

type TLogoImageProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export function LogoImage({ src, alt, size = 18, className }: TLogoImageProps) {
  return (
    <span
      className={cn('relative block shrink-0 overflow-hidden', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </span>
  );
}
