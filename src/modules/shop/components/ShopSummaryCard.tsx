import { Store } from 'lucide-react';

import { SellerVerifiedBadge } from './SellerVerifiedBadge';

export type ShopSummaryCardProps = {
  name: string;
  subtitle?: string;
  verified?: boolean;
  className?: string;
};

export function ShopSummaryCard({
  name,
  subtitle = 'Seller',
  verified = true,
  className = '',
}: ShopSummaryCardProps) {
  return (
    <div
      className={`border-rewear-border bg-rewear-soft/30 rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-rewear-soft text-rewear-text border-rewear-border flex size-11 items-center justify-center rounded-full border">
            <Store size={20} />
          </div>
          <div>
            <p className="text-rewear-muted text-xs">{subtitle}</p>
            <p className="text-rewear-text font-semibold">{name}</p>
          </div>
        </div>
        {verified && <SellerVerifiedBadge />}
      </div>
    </div>
  );
}
