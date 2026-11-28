'use client';

import { useState } from 'react';

import { ratingsApi } from '@/modules/ratings/ratings-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';

export function RateShopDialog({
  orderId,
  shopName,
  enabled,
}: {
  orderId: string;
  shopName: string;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const myRatingsQuery = useQuery({
    queryKey: ['ratings', 'mine'],
    queryFn: () => ratingsApi.getMyRatings(0),
    enabled,
  });

  const existing = (myRatingsQuery.data?.data ?? []).find(
    (item) => item.orderId === orderId,
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      ratingsApi.upsertRating({
        orderId,
        stars,
        comment,
      }),
    onSuccess: () => {
      setOpen(false);
      setError(null);
      addToast({
        type: 'success',
        title: existing ? 'Rating updated' : 'Thank you for rating the shop',
        durationMs: 3500,
      });
      void queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handleOpen = () => {
    setStars(existing?.stars ?? 5);
    setComment(existing?.comment ?? '');
    setError(null);
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={handleOpen}
        className="border-rewear-text text-rewear-text hover:bg-rewear-text flex min-h-12 w-full items-center justify-center gap-2 border px-4 text-sm font-semibold transition hover:text-white"
      >
        <Star size={16} aria-hidden="true" />
        {existing ? `Edit rating (${existing.stars} / 5)` : 'Rate shop'}
      </button>

      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[480px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitMutation.mutate();
          }}
          className="space-y-6"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>

          <div className="space-y-1">
            <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              Rate {shopName}
            </h2>
            <p className="text-rewear-muted text-sm">
              Share your experience with item condition and packing.
            </p>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-rewear-muted text-xs font-semibold">
              Rating (1 to 5 stars)
            </legend>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => {
                const active = value <= stars;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-label={`${value} ${value === 1 ? 'star' : 'stars'}`}
                    aria-pressed={stars === value}
                    onClick={() => setStars(value)}
                    className={`flex size-11 items-center justify-center border transition ${
                      active
                        ? 'border-rewear-text bg-rewear-accent text-rewear-text'
                        : 'border-rewear-border bg-rewear-soft text-rewear-muted'
                    }`}
                  >
                    <Star
                      size={18}
                      fill={active ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="bg-rewear-soft space-y-1 p-3.5">
            <label
              htmlFor="shop-review-comment"
              className="text-rewear-muted block text-xs font-semibold"
            >
              Review comment (optional)
            </label>
            <textarea
              id="shop-review-comment"
              rows={3}
              maxLength={5000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Accurate measurements, clean condition, fast dispatch…"
              className="w-full resize-none bg-transparent text-sm outline-none"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-12 w-full text-sm font-semibold transition disabled:opacity-50"
          >
            {submitMutation.isPending
              ? 'Saving rating…'
              : existing
                ? 'Update rating'
                : 'Submit rating'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
