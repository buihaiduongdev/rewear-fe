'use client';

import Image from 'next/image';
import Link from 'next/link';

import { getApiErrorMessage } from '@/shared/api/api-error';
import { Check, Copy, Store } from 'lucide-react';

import { useOpenShop } from '../hooks/use-open-shop';

export function OpenShopPage() {
  const {
    shopNameInputId,
    shopAboutInputId,
    name,
    setName,
    description,
    setDescription,
    copied,
    logoPreview,
    logoFile,
    logoError,
    removeLogo,
    handleLogoChange,
    createdShopId,
    submitting,
    existingShop,
    createShop,
    slug,
    initials,
    handleCopyUrl,
    handleSubmit,
  } = useOpenShop();

  // If user already owns a shop, show Figma 66:311 existing shop notice
  if (existingShop && !createdShopId) {
    return (
      <div className="bg-rewear-surface text-rewear-text min-h-dvh">
        <header className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
          <Link
            href="/"
            aria-label="RE.WEAR home"
            className="flex min-h-11 items-center"
          >
            <Image
              src="/brands/rewear-wordmark.svg"
              alt="RE.WEAR"
              width={91}
              height={16}
              className="h-auto w-[60px]"
              unoptimized
            />
          </Link>
          <span className="text-rewear-muted hidden sm:block">Shop setup</span>
          <Link href="/" className="inline-flex min-h-11 items-center">
            Back to marketplace
          </Link>
        </header>

        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 py-16"
        >
          <div className="border-rewear-border space-y-6 border p-6 md:p-8">
            <div className="flex items-center justify-between">
              <span className="bg-rewear-accent text-rewear-text inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold">
                <Store size={14} /> ACTIVE SHOP
              </span>
              <Link
                href="/selling"
                className="text-rewear-muted hover:text-rewear-text text-sm"
              >
                Close ×
              </Link>
            </div>

            <div className="space-y-2">
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Your shop is already set up
              </h1>
              <p className="text-rewear-muted text-base leading-6">
                You own{' '}
                <strong className="text-rewear-text">
                  {existingShop.shop.name}
                </strong>
                . Manage your listings, pickup address, and shipments from the
                seller workspace.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/selling"
                className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full items-center justify-center text-sm font-semibold transition"
              >
                Open seller workspace
              </Link>
              <Link
                href={`/selling/pickup?shopId=${encodeURIComponent(existingShop.shopId)}`}
                className="border-rewear-border text-rewear-text hover:bg-rewear-soft flex min-h-11 w-full items-center justify-center border text-sm font-medium transition"
              >
                Configure pickup address
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-rewear-surface text-rewear-text min-h-dvh">
      {/* Navigation Header (Figma 63:2227) */}
      <header className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
        <Link
          href="/"
          aria-label="RE.WEAR home"
          className="flex min-h-11 items-center"
        >
          <Image
            src="/brands/rewear-wordmark.svg"
            alt="RE.WEAR"
            width={91}
            height={16}
            className="h-auto w-[60px]"
            unoptimized
          />
        </Link>
        <span className="text-rewear-muted hidden sm:block">Shop setup</span>
        <Link href="/" className="inline-flex min-h-11 items-center">
          Back to marketplace
        </Link>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-6 md:p-12"
      >
        {/* Stepper Timeline (Figma 86:1464) */}
        <div className="mx-auto max-w-[720px] py-2">
          <div className="flex items-center">
            {/* Step 1: Active */}
            <div className="flex flex-col items-center">
              <div className="border-rewear-text bg-rewear-accent flex size-4 items-center justify-center rounded-full border-2" />
              <span className="text-rewear-text mt-2 text-xs font-semibold whitespace-nowrap">
                Shop details
              </span>
            </div>

            {/* Line 1 */}
            <div className="bg-rewear-border mx-2 h-0.5 flex-1" />

            {/* Step 2: Next */}
            <div className="flex flex-col items-center">
              <div className="border-rewear-border bg-rewear-surface flex size-4 items-center justify-center rounded-full border" />
              <span className="text-rewear-muted mt-2 text-xs whitespace-nowrap">
                Pickup address
              </span>
            </div>

            {/* Line 2 */}
            <div className="bg-rewear-border mx-2 h-0.5 flex-1" />

            {/* Step 3: Done */}
            <div className="flex flex-col items-center">
              <div className="border-rewear-border bg-rewear-surface flex size-4 items-center justify-center rounded-full border" />
              <span className="text-rewear-muted mt-2 text-xs whitespace-nowrap">
                Shop ready
              </span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Open your shop
          </h1>
        </div>

        {/* Form and Summary Grid (Figma 63:2236) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Main Form (7 cols) */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 lg:col-span-7 xl:col-span-7"
          >
            {/* Field: Shop name */}
            <div className="bg-rewear-soft space-y-2 p-4">
              <label
                htmlFor={shopNameInputId}
                className="text-rewear-text block text-sm font-semibold"
              >
                Shop name <span className="text-red-500">*</span>
              </label>
              <input
                id={shopNameInputId}
                type="text"
                required
                maxLength={100}
                disabled={Boolean(createdShopId) || submitting}
                placeholder="e.g. Hanoi Archive"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-rewear-text placeholder:text-rewear-muted/60 min-h-11 w-full border-none bg-transparent text-base focus:outline-none"
              />
            </div>

            {/* Field: About your shop */}
            <div className="bg-rewear-soft space-y-2 p-4">
              <label
                htmlFor={shopAboutInputId}
                className="text-rewear-text block text-sm font-semibold"
              >
                About your shop
              </label>
              <textarea
                id={shopAboutInputId}
                rows={3}
                disabled={Boolean(createdShopId) || submitting}
                maxLength={1000}
                placeholder="Curated pre-owned clothing, based in Hanoi."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-rewear-text placeholder:text-rewear-muted/60 w-full resize-y border-none bg-transparent text-base focus:outline-none"
              />
            </div>

            <div className="space-y-2 py-2">
              <label
                htmlFor="shop-logo-file"
                className="text-rewear-text block text-sm font-semibold"
              >
                Upload shop logo (optional)
              </label>
              <input
                id="shop-logo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleLogoChange}
                disabled={submitting}
                className="sr-only"
              />
              <label
                htmlFor="shop-logo-file"
                className="border-rewear-border inline-flex min-h-11 cursor-pointer items-center border px-4 text-sm font-semibold"
              >
                Choose image
              </label>
              {logoFile && <p className="text-sm break-all">{logoFile.name}</p>}
              <p className="text-rewear-muted text-xs">
                JPG, PNG, WebP or AVIF, up to 5 MB.
              </p>
              {logoFile && (
                <button
                  type="button"
                  onClick={removeLogo}
                  disabled={submitting}
                  className="text-sm underline"
                >
                  Remove logo
                </button>
              )}
              {logoError && (
                <p role="alert" className="text-sm text-red-700">
                  {logoError}
                </p>
              )}
            </div>

            {/* Error Display */}
            {!!createShop.error && (
              <div
                role="alert"
                className="border-destructive/30 bg-destructive/10 text-destructive border p-4 text-sm"
              >
                {getApiErrorMessage(createShop.error)}
              </div>
            )}
          </form>

          {/* Context Summary / Live Preview (5 cols) */}
          <aside className="space-y-4 lg:col-span-5 xl:col-span-5">
            <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
              Preview your shop
            </h2>

            <div className="bg-rewear-soft border-rewear-border space-y-6 border p-6">
              {/* Shop Identity Card */}
              <div className="flex items-center gap-4">
                <div className="bg-rewear-text text-rewear-accent flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-bold">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Shop logo preview"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-rewear-text truncate text-lg font-semibold">
                    {name.trim() || 'Your shop'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-rewear-muted truncate font-mono text-xs">
                      rewear.vn/shops/{slug}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="text-rewear-muted hover:text-rewear-text"
                      title="Copy URL"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-rewear-muted text-sm leading-5">
                {description.trim() ||
                  'Curated pre-owned clothing, based in Hanoi.'}
              </p>

              <div className="border-rewear-border border-t pt-4">
                <button
                  type="button"
                  disabled={!name.trim() || submitting}
                  onClick={handleSubmit}
                  className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 disabled:bg-rewear-border disabled:text-rewear-muted flex min-h-12 w-full items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating shop…' : 'Continue to pickup address'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
