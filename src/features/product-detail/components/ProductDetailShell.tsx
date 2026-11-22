'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';

export function ProductDetailShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh pb-24 [--foreground:var(--color-rewear-text)] [--muted-foreground:var(--color-rewear-muted)] lg:pb-0">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main id="main-content">{children}</main>
      <MarketplaceFooter showOnMobile />
    </div>
  );
}
