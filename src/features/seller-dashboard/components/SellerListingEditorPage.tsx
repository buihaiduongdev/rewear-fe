'use client';

import { useRef, useState } from 'react';

import Link from 'next/link';

import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ListChecks,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';

import { useSellerListingEditor } from '../hooks/use-seller-listing-editor';
import { listingMeasurementFields } from '../utils/listing-form';
import { ListingChecklistModal } from './SellerModals';

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'border-rewear-border bg-rewear-soft text-rewear-text',
  },
  PENDING_REVIEW: {
    label: 'In review',
    className: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  ACTIVE: {
    label: 'Active',
    className: 'border-rewear-text bg-rewear-accent text-rewear-text',
  },
  HIDDEN: {
    label: 'Hidden',
    className: 'border-rewear-border bg-rewear-soft text-rewear-muted',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'border-red-300 bg-red-50 text-red-800',
  },
  HELD: {
    label: 'Held',
    className: 'border-rewear-border bg-rewear-soft text-rewear-muted',
  },
  SOLD: {
    label: 'Sold',
    className: 'border-rewear-border bg-rewear-soft text-rewear-muted',
  },
  SUSPENDED: {
    label: 'Suspended',
    className: 'border-red-300 bg-red-50 text-red-800',
  },
};

const LOCKED_STATUSES = new Set([
  'HELD',
  'SOLD',
  'SUSPENDED',
  'PENDING_REVIEW',
]);

const fieldClassName =
  'border-rewear-border bg-rewear-soft text-rewear-text placeholder:text-rewear-muted focus:border-rewear-text focus:bg-rewear-surface mt-1.5 block min-h-11 w-full rounded-[8px] border px-3.5 py-2.5 text-sm outline-none transition';

export function SellerListingEditorPage({ shopId }: { shopId: string }) {
  const {
    productId,
    busy,
    message,
    error,
    aiSuggesting,
    aiError,
    aiModel,
    angle,
    setAngle,
    product,
    categories,
    media,
    save,
    suggestDescription,
    upload,
    updatePhoto,
  } = useSellerListingEditor(shopId);

  const formRef = useRef<HTMLFormElement>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [draftDescription, setDraftDescription] = useState<string | null>(null);
  const [syncedProductKey, setSyncedProductKey] = useState('');

  const current = product.data?.data;
  const currentSyncKey = `${productId}:${current?.updatedAt ?? ''}`;
  if (syncedProductKey !== currentSyncKey) {
    setSyncedProductKey(currentSyncKey);
    setDraftDescription(null);
  }

  if (!shopId) {
    return (
      <div className="border-rewear-border bg-rewear-surface max-w-2xl rounded-[8px] border p-6">
        <p className="text-rewear-text text-sm font-semibold">
          Open a shop before creating a listing.
        </p>
      </div>
    );
  }

  if (productId && product.isPending) {
    return (
      <div
        role="status"
        className="border-rewear-border bg-rewear-soft/40 flex h-56 max-w-4xl items-center justify-center rounded-[8px] border"
      >
        <span className="text-rewear-muted text-sm">Loading listing…</span>
      </div>
    );
  }

  if (productId && product.isError) {
    return (
      <div
        role="alert"
        className="border-rewear-border bg-rewear-surface flex max-w-2xl flex-col items-start gap-3 rounded-[8px] border p-6"
      >
        <p className="text-rewear-text text-sm font-semibold">
          Could not load listing.
        </p>
        <button
          type="button"
          onClick={() => void product.refetch()}
          className="border-rewear-border text-rewear-text hover:bg-rewear-soft min-h-11 rounded-[8px] border px-4 text-sm font-semibold transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentStatus = current?.status;
  const isPublished = currentStatus === 'ACTIVE' || currentStatus === 'HIDDEN';
  const isLocked = Boolean(currentStatus && LOCKED_STATUSES.has(currentStatus));
  const statusBadge = currentStatus ? STATUS_BADGE_MAP[currentStatus] : null;
  const descriptionValue = draftDescription ?? current?.description ?? '';

  async function handleSuggestDescription() {
    if (!formRef.current) return;
    const generated = await suggestDescription(formRef.current, aiNotes);
    if (generated) {
      setDraftDescription(generated);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link
            href="/selling?tab=products"
            className="text-rewear-muted hover:text-rewear-text inline-flex items-center gap-1.5 text-sm font-semibold transition"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to products
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em] sm:text-[36px] sm:leading-[42px]">
              {productId ? 'Edit listing' : 'Create listing'}
            </h1>
            {statusBadge && (
              <span
                className={`inline-flex items-center rounded-[8px] border px-2.5 py-1 text-xs font-semibold ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            )}
          </div>
          <p className="text-rewear-muted text-sm">
            Describe one unique pre-owned piece accurately, upload clear photos,
            then submit for content review.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setChecklistOpen(true)}
          className="border-rewear-border text-rewear-text hover:bg-rewear-soft inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[8px] border px-4 text-sm font-semibold transition"
        >
          <ListChecks size={16} aria-hidden="true" />
          Listing checklist
        </button>
      </div>

      {/* Explicit Re-moderation Warning for ACTIVE / HIDDEN listings */}
      {isPublished && (
        <div
          role="note"
          aria-label="Re-moderation notice"
          className="flex items-start gap-3 rounded-[8px] border border-amber-300 bg-amber-50 p-4 text-amber-950"
        >
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-amber-700"
            aria-hidden="true"
          />
          <div className="space-y-1 text-sm">
            <p className="font-semibold">
              Saving changes triggers Admin re-review
            </p>
            <p className="text-amber-900">
              This listing is currently{' '}
              {currentStatus === 'ACTIVE'
                ? 'live on the marketplace'
                : 'hidden'}
              . Saving any content or price changes will hide it from buyers
              until an Admin approves the updated listing again.
            </p>
          </div>
        </div>
      )}

      {/* Locked State Notice */}
      {isLocked && (
        <div
          role="note"
          className="border-rewear-border bg-rewear-soft flex items-start gap-3 rounded-[8px] border p-4 text-sm"
        >
          <AlertTriangle
            size={18}
            className="text-rewear-muted mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="text-rewear-text">
            This listing is currently{' '}
            <span className="font-semibold">
              {statusBadge?.label ?? currentStatus}
            </span>{' '}
            and cannot be edited right now.
          </p>
        </div>
      )}

      {/* Feedback Alerts */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[8px] border border-red-200 bg-red-50 p-4 text-sm font-medium text-[#BA1A1A]"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="border-rewear-text bg-rewear-accent/25 text-rewear-text flex items-start gap-2.5 rounded-[8px] border p-4 text-sm font-semibold"
        >
          <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Listing Form */}
      <form
        ref={formRef}
        key={currentSyncKey}
        onSubmit={(event) => {
          event.preventDefault();
          void save(event.currentTarget, false);
        }}
        className="space-y-6"
      >
        {/* Basic Details & AI Description Card */}
        <section className="border-rewear-border bg-rewear-surface space-y-5 rounded-[8px] border p-6">
          <h2 className="text-rewear-text text-lg font-semibold">
            Item details
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-rewear-text block text-sm font-semibold sm:col-span-2">
              Title
              <input
                name="title"
                defaultValue={current?.title ?? ''}
                maxLength={150}
                disabled={isLocked}
                placeholder="e.g., Uniqlo U wool blend tailored coat"
                className={fieldClassName}
              />
            </label>

            <label className="text-rewear-text block text-sm font-semibold">
              Category
              <select
                name="categoryId"
                defaultValue={current?.categoryId ?? ''}
                disabled={isLocked}
                className={fieldClassName}
              >
                <option value="">Select category</option>
                {categories.data?.data
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="text-rewear-text block text-sm font-semibold">
              Condition
              <select
                name="condition"
                defaultValue={current?.condition ?? ''}
                disabled={isLocked}
                className={fieldClassName}
              >
                <option value="">Select condition</option>
                <option value="PRISTINE">Like new</option>
                <option value="EXCELLENT">Very good</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </label>
          </div>

          {categories.isError && (
            <div
              role="alert"
              className="flex items-center justify-between rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-[#BA1A1A]"
            >
              <span>Could not load categories.</span>
              <button
                type="button"
                onClick={() => void categories.refetch()}
                className="cursor-pointer font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {(
              [
                { name: 'size', label: 'Size', placeholder: 'e.g., M, EU 40' },
                { name: 'brand', label: 'Brand', placeholder: 'e.g., Lemaire' },
                {
                  name: 'color',
                  label: 'Color',
                  placeholder: 'e.g., Charcoal grey',
                },
                {
                  name: 'repairs',
                  label: 'Repairs',
                  placeholder: 'None, or describe any alterations',
                },
              ] as const
            ).map(({ name, label, placeholder }) => (
              <label
                className="text-rewear-text block text-sm font-semibold"
                key={name}
              >
                {label}
                <input
                  name={name}
                  defaultValue={current?.[name] ?? ''}
                  disabled={isLocked}
                  placeholder={placeholder}
                  className={fieldClassName}
                />
              </label>
            ))}
          </div>

          {/* Description + Gemini AI Assist */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="listing-description"
                className="text-rewear-text text-sm font-semibold"
              >
                Description
              </label>
              <button
                type="button"
                disabled={busy || aiSuggesting || isLocked}
                onClick={() => void handleSuggestDescription()}
                className="border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] border px-3.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiSuggesting ? (
                  <>
                    <Loader2
                      size={14}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Generating with AI…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} aria-hidden="true" />
                    Suggest description with AI
                  </>
                )}
              </button>
            </div>

            <textarea
              id="listing-description"
              name="description"
              rows={5}
              maxLength={5000}
              disabled={isLocked}
              value={descriptionValue}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder="Describe fabric feel, fit, wear history, and any visible flaws..."
              className={`${fieldClassName} mt-0 min-h-32 resize-y`}
            />

            <div className="bg-rewear-soft/60 border-rewear-border flex flex-col gap-2 rounded-[8px] border p-3 sm:flex-row sm:items-center">
              <label
                htmlFor="ai-notes"
                className="text-rewear-muted shrink-0 text-xs font-semibold"
              >
                AI notes (optional)
              </label>
              <input
                id="ai-notes"
                type="text"
                value={aiNotes}
                maxLength={1000}
                disabled={isLocked || aiSuggesting}
                onChange={(event) => setAiNotes(event.target.value)}
                placeholder="Extra hints for Gemini AI (e.g., worn twice, light pilling near cuff)"
                className="border-rewear-border bg-rewear-surface text-rewear-text placeholder:text-rewear-muted min-h-9 w-full rounded-[8px] border px-3 text-xs outline-none"
              />
            </div>

            {aiModel && !aiError && (
              <p className="text-rewear-muted text-xs">
                Drafted with Gemini AI ({aiModel}). Review and adjust before
                saving.
              </p>
            )}

            {aiError && (
              <p
                role="alert"
                className="rounded-[8px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-[#BA1A1A]"
              >
                {aiError}
              </p>
            )}
          </div>

          <div className="max-w-xs">
            <label className="text-rewear-text block text-sm font-semibold">
              Price (VND)
              <input
                name="price"
                type="number"
                min="0"
                step="1"
                disabled={isLocked}
                defaultValue={current?.price ?? ''}
                placeholder="350000"
                className={`${fieldClassName} font-mono tabular-nums`}
              />
            </label>
          </div>
        </section>

        {/* Measurements Card */}
        <fieldset className="border-rewear-border bg-rewear-surface space-y-4 rounded-[8px] border p-6">
          <legend className="text-rewear-text px-1 text-lg font-semibold">
            Measurements (cm)
          </legend>
          <p className="text-rewear-muted text-xs">
            Lay the garment flat to measure accurately. Required measurements
            depend on the selected category.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {listingMeasurementFields.map((name) => (
              <label
                className="text-rewear-text block text-sm font-semibold capitalize"
                key={name}
              >
                {name}
                <input
                  name={name}
                  type="number"
                  min="0.1"
                  max="500"
                  step="0.1"
                  disabled={isLocked}
                  defaultValue={current?.measurements?.[name] ?? ''}
                  className={`${fieldClassName} font-mono tabular-nums`}
                />
              </label>
            ))}
          </div>
        </fieldset>

        {/* Shipping Package Card */}
        <fieldset className="border-rewear-border bg-rewear-surface space-y-4 rounded-[8px] border p-6">
          <legend className="text-rewear-text px-1 text-lg font-semibold">
            Shipping package
          </legend>
          <p className="text-rewear-muted text-xs">
            Provide weight and parcel dimensions for accurate GHN shipping
            quotes at checkout.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(['weightGrams', 'lengthCm', 'widthCm', 'heightCm'] as const).map(
              (name) => (
                <label
                  key={name}
                  className="text-rewear-text block text-sm font-semibold capitalize"
                >
                  {name === 'weightGrams'
                    ? 'Weight (g)'
                    : `${name.replace('Cm', '')} (cm)`}
                  <input
                    name={name}
                    type="number"
                    min="1"
                    step="1"
                    disabled={isLocked}
                    defaultValue={current?.shippingPackage?.[name] ?? ''}
                    className={`${fieldClassName} font-mono tabular-nums`}
                  />
                </label>
              ),
            )}
          </div>
        </fieldset>

        {/* Primary Action Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || isLocked}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[8px] px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPublished ? 'Save changes for review' : 'Save draft'}
          </button>
          {!isPublished && (
            <button
              type="button"
              disabled={busy || isLocked}
              onClick={(event) => {
                const form = event.currentTarget.form;
                if (form && form.reportValidity()) void save(form, true);
              }}
              className="border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft inline-flex min-h-12 cursor-pointer items-center justify-center rounded-[8px] border px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit for review
            </button>
          )}
        </div>
      </form>

      {/* Photos Card */}
      <section className="border-rewear-border bg-rewear-surface space-y-5 rounded-[8px] border p-6">
        <div className="space-y-1">
          <h2 className="text-rewear-text text-lg font-semibold">Photos</h2>
          <p className="text-rewear-muted text-sm">
            {!productId
              ? 'Save the draft before uploading photos.'
              : 'Upload at least 3 photos including FRONT, BACK, and LABEL angles before submitting for review.'}
          </p>
        </div>

        {productId && (
          <>
            <div className="bg-rewear-soft/60 border-rewear-border flex flex-col gap-4 rounded-[8px] border p-4 sm:flex-row sm:items-end">
              <label className="text-rewear-text block text-sm font-semibold sm:w-48">
                Photo angle
                <select
                  value={angle}
                  disabled={busy || isLocked}
                  onChange={(event) =>
                    setAngle(event.target.value as typeof angle)
                  }
                  className={fieldClassName}
                >
                  {['FRONT', 'BACK', 'LABEL', 'DETAIL', 'DEFECT'].map(
                    (value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[8px] border px-4 text-sm font-semibold transition">
                <Upload size={16} aria-hidden="true" />
                <span>Choose image</span>
                <input
                  aria-label="Upload photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy || isLocked}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                    event.currentTarget.value = '';
                  }}
                  className="sr-only"
                />
              </label>
            </div>

            {media.isError && (
              <p role="alert" className="text-sm font-medium text-[#BA1A1A]">
                Could not load photos.
              </p>
            )}

            {(media.data?.data.length ?? 0) > 0 && (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {media.data?.data.map((item) => (
                  <li
                    key={item.id}
                    className="border-rewear-border bg-rewear-surface flex flex-col overflow-hidden rounded-[8px] border"
                  >
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-rewear-soft relative aspect-[4/5] w-full overflow-hidden"
                    >
                      <ProductPhoto
                        url={item.url}
                        title={item.angle ?? 'Listing photo'}
                        sizes="200px"
                      />
                    </a>
                    <div className="flex flex-1 flex-col justify-between gap-2 p-3 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-rewear-text font-mono font-semibold">
                          {item.angle ?? 'PHOTO'}
                        </span>
                        {item.role === 'COVER' && (
                          <span className="bg-rewear-accent text-rewear-text rounded px-1.5 py-0.5 font-semibold">
                            Cover
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {item.role !== 'COVER' ? (
                          <button
                            type="button"
                            disabled={busy || isLocked}
                            onClick={() => void updatePhoto('cover', item.id)}
                            className="text-rewear-text cursor-pointer font-semibold underline disabled:opacity-50"
                          >
                            Set cover
                          </button>
                        ) : (
                          <span className="text-rewear-muted">Main photo</span>
                        )}
                        <button
                          type="button"
                          disabled={busy || isLocked}
                          onClick={() => void updatePhoto('delete', item.id)}
                          className="cursor-pointer font-semibold text-[#BA1A1A] underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <ListingChecklistModal
        open={checklistOpen}
        onOpenChange={setChecklistOpen}
      />
    </div>
  );
}
