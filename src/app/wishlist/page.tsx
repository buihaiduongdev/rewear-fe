import type { Metadata } from 'next';

import { WishlistPage } from '@/features/wishlist/components/WishlistPage';

export const metadata: Metadata = {
  title: 'Wishlist | RE.WEAR',
  description: 'Your saved pieces on RE.WEAR',
};

export default function Page() {
  return <WishlistPage />;
}
