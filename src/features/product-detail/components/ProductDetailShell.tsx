'use client';

import type { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';

export function ProductDetailShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col [--foreground:var(--color-rewear-text)] [--muted-foreground:var(--color-rewear-muted)] has-[[data-product-purchase-bar]]:pb-24 lg:has-[[data-product-purchase-bar]]:pb-0">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <MarketplaceFooter showOnMobile />
    </div>
  );
}
