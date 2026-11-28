'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { ProductControllerReviewQueue200DataDataItem } from '@/shared/api/models';
import { useMediaControllerFindAll } from '@/shared/api/query-generated/product-media/product-media';
import {
  useProductControllerModerate,
  useProductControllerModerationForAdmin,
  useProductControllerReviewDetail,
  useProductControllerSuspend,
} from '@/shared/api/query-generated/products/products';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { AlertTriangle, CheckCircle2, ImageIcon } from 'lucide-react';

interface AdminReviewListingModalProps {
  listing: ProductControllerReviewQueue200DataDataItem | null;
  onClose: () => void;
  onModerated: (message: string) => void;
}

export function AdminReviewListingModal({
  listing,
  onClose,
  onModerated,
}: AdminReviewListingModalProps) {
  const productId = listing?.id ?? '';
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [trackedProductId, setTrackedProductId] = useState('');

  if (trackedProductId !== productId) {
    setTrackedProductId(productId);
    setReason('');
    setActionError('');
    setSelectedPhotoUrl(null);
  }

  const detailQuery = useProductControllerReviewDetail(productId, {
    query: {
      enabled: Boolean(productId),
      meta: { skipErrorToast: true },
    },
  });

  const moderationQuery = useProductControllerModerationForAdmin(productId, {
    query: {
      enabled: Boolean(productId),
      meta: { skipErrorToast: true },
    },
  });

  const detail = detailQuery.data?.data ?? listing;
  const isPublishedActive = detail?.status === 'ACTIVE';

  const mediaQuery = useMediaControllerFindAll(productId, {
    query: {
      enabled: Boolean(productId) && isPublishedActive,
      retry: false,
      meta: { skipErrorToast: true },
    },
  });

  const moderateMutation = useProductControllerModerate();
  const suspendMutation = useProductControllerSuspend();

  const moderation = moderationQuery.data?.data;
  const isPendingReview = detail?.status === 'PENDING_REVIEW';
  const busy = moderateMutation.isPending || suspendMutation.isPending;

  const galleryItems = mediaQuery.data?.data ?? [];
  const activePhotoUrl =
    selectedPhotoUrl ?? galleryItems[0]?.url ?? detail?.coverUrl ?? null;

  const measurementEntries = Object.entries(detail?.measurements ?? {}).filter(
    ([, value]) => typeof value === 'number' && value > 0,
  );

  async function handleApprove() {
    if (!productId || !moderation) return;
    setActionError('');
    try {
      await moderateMutation.mutateAsync({
        productId,
        data: {
          version: moderation.version,
          decision: 'APPROVE',
        },
      });
      onModerated(`Approved "${detail?.title ?? 'listing'}".`);
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  async function handleReject() {
    if (!productId || !moderation) return;
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setActionError('Please enter a rejection reason before rejecting.');
      return;
    }
    setActionError('');
    try {
      await moderateMutation.mutateAsync({
        productId,
        data: {
          version: moderation.version,
          decision: 'REJECT',
          reason: trimmedReason,
        },
      });
      onModerated(`Rejected "${detail?.title ?? 'listing'}".`);
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  async function handleSuspend() {
    if (!productId) return;
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setActionError('Please enter a suspension reason before suspending.');
      return;
    }
    setActionError('');
    try {
      await suspendMutation.mutateAsync({
        productId,
        data: { reason: trimmedReason },
      });
      onModerated(`Suspended "${detail?.title ?? 'listing'}".`);
      onClose();
    } catch (error) {
      setActionError(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog
      open={Boolean(listing)}
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-h-[90dvh] max-w-[640px] overflow-y-auto rounded-[8px] border p-6 shadow-2xl sm:max-w-[640px] md:p-8"
      >
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted min-h-11 cursor-pointer text-sm font-semibold transition disabled:opacity-50"
          >
            Close ×
          </button>
          {moderation && (
            <span className="text-rewear-muted font-mono text-xs font-semibold">
              Review v{moderation.version}
            </span>
          )}
        </div>

        <DialogHeader className="gap-1">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            {isPendingReview ? 'Review listing' : 'Listing snapshot'}
          </DialogTitle>
          <DialogDescription>
            {detail?.shop?.name ?? 'Shop'} ·{' '}
            {detail?.category?.name ?? 'Uncategorized'} ·{' '}
            {formatPrice(detail?.price ?? null)}
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isError && (
          <div
            role="alert"
            className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-sm text-[#BA1A1A]"
          >
            Could not refresh full listing details. Showing queue snapshot.
          </div>
        )}

        {detail && (
          <div className="space-y-6 pt-2">
            {/* Photo Gallery / Cover Preview */}
            <div className="space-y-3">
              <div className="bg-rewear-soft border-rewear-border relative aspect-[4/3] w-full overflow-hidden rounded-[8px] border">
                <ProductPhoto
                  url={activePhotoUrl}
                  title={detail.title}
                  sizes="600px"
                />
                <span className="bg-rewear-surface/90 text-rewear-text border-rewear-border absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 py-1 font-mono text-xs font-semibold">
                  <ImageIcon size={12} aria-hidden="true" />
                  {detail.mediaCount}{' '}
                  {detail.mediaCount === 1 ? 'photo' : 'photos'}
                </span>
              </div>

              {galleryItems.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {galleryItems.map((item) => {
                    const isSelected = activePhotoUrl === item.url;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedPhotoUrl(item.url)}
                        className={`bg-rewear-soft relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border transition ${
                          isSelected
                            ? 'border-rewear-text ring-rewear-text ring-1'
                            : 'border-rewear-border opacity-75 hover:opacity-100'
                        }`}
                        aria-label={`View ${item.angle ?? 'product'} photo`}
                      >
                        <ProductPhoto
                          url={item.url}
                          title={item.angle ?? detail.title}
                          sizes="64px"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Listing Facts */}
            <div className="space-y-3">
              <h3 className="text-rewear-text text-lg font-semibold">
                {detail.title ?? 'Untitled listing'}
              </h3>
              <p className="text-rewear-text text-sm leading-relaxed whitespace-pre-line">
                {detail.description || 'No description provided.'}
              </p>
            </div>

            {/* Condition & Disclosure Facts Grid */}
            <dl className="border-rewear-border bg-rewear-soft/60 grid grid-cols-2 gap-4 rounded-[8px] border p-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Condition
                </dt>
                <dd className="text-rewear-text mt-0.5 font-semibold">
                  {formatCondition(detail.condition) ?? 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Size
                </dt>
                <dd className="text-rewear-text mt-0.5 font-semibold">
                  {detail.size || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Brand
                </dt>
                <dd className="text-rewear-text mt-0.5 font-semibold">
                  {detail.brand || 'Unbranded'}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Color
                </dt>
                <dd className="text-rewear-text mt-0.5 font-semibold">
                  {detail.color || 'Not specified'}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Price
                </dt>
                <dd className="text-rewear-text mt-0.5 font-mono font-semibold tabular-nums">
                  {formatPrice(detail.price)}
                </dd>
              </div>
              <div>
                <dt className="text-rewear-muted text-xs font-semibold">
                  Status
                </dt>
                <dd className="text-rewear-text mt-0.5 font-semibold">
                  {detail.status}
                </dd>
              </div>
            </dl>

            {/* Measurements & Disclosures */}
            {(measurementEntries.length > 0 ||
              detail.repairs ||
              detail.defects.length > 0) && (
              <div className="border-rewear-border space-y-3 rounded-[8px] border p-4 text-sm">
                <h4 className="text-rewear-text font-semibold">
                  Condition disclosures
                </h4>
                {measurementEntries.length > 0 && (
                  <p className="text-rewear-text">
                    <span className="text-rewear-muted font-semibold">
                      Measurements:{' '}
                    </span>
                    <span className="font-mono text-xs">
                      {measurementEntries
                        .map(([key, value]) => `${key} ${value}cm`)
                        .join(' · ')}
                    </span>
                  </p>
                )}
                {detail.repairs && (
                  <p className="text-rewear-text">
                    <span className="text-rewear-muted font-semibold">
                      Repairs:{' '}
                    </span>
                    {detail.repairs}
                  </p>
                )}
                {detail.defects.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-rewear-muted font-semibold">
                      Reported defects:
                    </p>
                    <ul className="text-rewear-text list-disc space-y-1 pl-5">
                      {detail.defects.map((defect, index) => (
                        <li key={index}>{defect.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Existing Moderation Reason */}
            {moderation?.reason && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm">
                <p className="font-semibold text-[#BA1A1A]">
                  Last moderation note
                </p>
                <p className="mt-1 text-red-900">{moderation.reason}</p>
              </div>
            )}

            {actionError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-[#BA1A1A]"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Moderation Controls for PENDING_REVIEW */}
            {isPendingReview && (
              <div className="border-rewear-border space-y-4 border-t pt-5">
                {moderationQuery.isPending ? (
                  <p role="status" className="text-rewear-muted text-sm">
                    Loading review version…
                  </p>
                ) : moderationQuery.isError ? (
                  <div role="alert" className="text-sm text-[#BA1A1A]">
                    Could not load moderation state.{' '}
                    <button
                      type="button"
                      onClick={() => void moderationQuery.refetch()}
                      className="font-semibold underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleApprove()}
                      className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      {moderateMutation.isPending
                        ? 'Submitting decision…'
                        : 'Approve listing'}
                    </button>

                    <div className="space-y-2.5 pt-2">
                      <label
                        htmlFor="moderation-rejection-reason"
                        className="text-rewear-text block text-sm font-semibold"
                      >
                        Rejection reason
                      </label>
                      <textarea
                        id="moderation-rejection-reason"
                        rows={3}
                        maxLength={2000}
                        value={reason}
                        disabled={busy}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Explain clearly what the seller needs to fix before resubmitting..."
                        className="border-rewear-border bg-rewear-soft text-rewear-text placeholder:text-rewear-muted focus:border-rewear-text focus:bg-rewear-surface w-full rounded-[8px] border p-3 text-sm transition outline-none"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleReject()}
                        className="border-rewear-border flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] border text-sm font-semibold text-[#BA1A1A] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject listing
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Suspend Action for ACTIVE listings */}
            {isPublishedActive && (
              <div className="border-rewear-border space-y-3 border-t pt-5">
                <label
                  htmlFor="moderation-suspend-reason"
                  className="text-rewear-text block text-sm font-semibold"
                >
                  Suspend listing reason
                </label>
                <textarea
                  id="moderation-suspend-reason"
                  rows={2}
                  maxLength={2000}
                  value={reason}
                  disabled={busy}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Provide policy reason to suspend this active listing..."
                  className="border-rewear-border bg-rewear-soft text-rewear-text placeholder:text-rewear-muted focus:border-rewear-text focus:bg-rewear-surface w-full rounded-[8px] border p-3 text-sm transition outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleSuspend()}
                  className="border-rewear-border flex h-11 w-full cursor-pointer items-center justify-center rounded-[8px] border text-sm font-semibold text-[#BA1A1A] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {suspendMutation.isPending
                    ? 'Suspending…'
                    : 'Suspend listing'}
                </button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
