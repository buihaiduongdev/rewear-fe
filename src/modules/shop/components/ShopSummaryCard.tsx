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
  subtitle = 'Người bán',
  verified = true,
  className = '',
}: ShopSummaryCardProps) {
  return (
    <div
      className={`rounded-lg border border-rewear-border bg-rewear-soft/30 p-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex size-11 items-center justify-center rounded-full bg-rewear-soft text-rewear-text border border-rewear-border">
            <Store size={20} />
          </div>
          <div>
            <p className="text-xs text-rewear-muted">{subtitle}</p>
            <p className="font-semibold text-rewear-text">{name}</p>
          </div>
        </div>
        {verified && <SellerVerifiedBadge />}
      </div>
    </div>
  );
}
