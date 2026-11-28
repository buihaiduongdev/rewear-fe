'use client';

import { useState } from 'react';

import { ratingsApi } from '@/modules/ratings/ratings-api';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';

export function ShopRatingSummary({
  shopId,
  shopName,
}: {
  shopId: string;
  shopName: string;
}) {
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const query = useQuery({
    queryKey: ['ratings', 'shop', shopId],
    queryFn: () => ratingsApi.getShopRatings(shopId, 0),
    enabled: Boolean(shopId),
  });

  if (query.isPending || query.isError || !query.data) return null;

  const { summary, ratings } = query.data.data;

  if (summary.count === 0) {
    return <p className="text-rewear-muted text-xs">No verified reviews yet</p>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setReviewsOpen(true)}
        className="text-rewear-text inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
      >
        <Star
          size={14}
          fill="currentColor"
          className="text-rewear-text"
          aria-hidden="true"
        />
        <span className="font-mono">
          {summary.average !== null ? summary.average.toFixed(1) : '—'}
        </span>
        <span className="text-rewear-muted font-normal">
          ({summary.count} {summary.count === 1 ? 'review' : 'reviews'})
        </span>
      </button>

      <Dialog open={reviewsOpen} onOpenChange={setReviewsOpen}>
        <DialogContent
          showCloseButton={false}
          className="bg-rewear-surface text-rewear-text border-rewear-border max-h-[85dvh] max-w-[560px] overflow-y-auto rounded-none border p-8 shadow-xl outline-none"
        >
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => setReviewsOpen(false)}
              className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
            >
              Close ×
            </button>

            <div className="space-y-1">
              <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Reviews for {shopName}
              </h2>
              <p className="text-rewear-muted text-sm">
                {summary.average !== null ? summary.average.toFixed(1) : '—'}{' '}
                average across {summary.count} verified{' '}
                {summary.count === 1 ? 'purchase' : 'purchases'}.
              </p>
            </div>

            <ul className="divide-rewear-border divide-y">
              {ratings.map((item) => (
                <li key={item.id} className="space-y-2 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className="inline-flex items-center gap-1 font-mono text-xs font-semibold"
                      aria-label={`${item.stars} out of 5 stars`}
                    >
                      <Star size={13} fill="currentColor" aria-hidden="true" />
                      {item.stars} / 5
                    </span>
                    <time className="text-rewear-muted text-xs">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </time>
                  </div>
                  {item.comment && (
                    <p className="text-sm leading-6">{item.comment}</p>
                  )}
                  {item.reply && (
                    <div className="bg-rewear-soft p-3 text-xs">
                      <p className="font-semibold">Seller reply</p>
                      <p className="text-rewear-muted mt-1">{item.reply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
