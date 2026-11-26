'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { MessageWorkspace } from '@/modules/chat/components/MessageWorkspace';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';

export function BuyerMessagesPage() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 md:px-12 md:py-12"
      >
        <MessageWorkspace
          side="BUYER"
          initialShopId={params.get('shopId') ?? undefined}
          initialProductId={params.get('productId') ?? undefined}
          initialOrderId={params.get('orderId') ?? undefined}
        />
      </main>
      <MobileNavigation cartAction={<CartLink />} />
      <MarketplaceFooter />
    </div>
  );
}
