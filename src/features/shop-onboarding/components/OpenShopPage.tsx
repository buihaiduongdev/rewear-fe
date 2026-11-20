'use client';

import { useId, useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/shared/api/api-error';
import {
  useShopControllerCreate,
  useShopControllerFindMine,
} from '@/shared/api/query-generated/shops/shops';
import { useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Store } from 'lucide-react';
import { useSession } from 'next-auth/react';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function OpenShopPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, status } = useSession();
  const shopNameInputId = useId();
  const shopAboutInputId = useId();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);

  const isAuthenticated = status === 'authenticated' && !session?.error;

  const memberships = useShopControllerFindMine({
    query: {
      enabled: isAuthenticated,
      queryKey: ['pickup-shop-memberships', session?.user.id],
    },
  });

  const existingShop = useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const createShop = useShopControllerCreate();

  const slug = useMemo(() => {
    const raw = name.trim() || 'your-shop';
    return slugify(raw);
  }, [name]);

  const initials = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return 'HA';
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }, [name]);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`rewear.vn/shops/${slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const result = await createShop.mutateAsync({
        data: {
          name: name.trim(),
          description: description.trim() || null,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: ['pickup-shop-memberships'],
      });

      const newShopId = result.data.id;
      router.push(`/selling/pickup?shopId=${encodeURIComponent(newShopId)}`);
    } catch {
      // Error handled by createShop.error
    }
  };

  // If user already owns a shop, show Figma 66:311 existing shop notice
  if (existingShop) {
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
        <div className="space-y-1">
          <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Open your shop
          </h1>
          <p className="text-rewear-muted text-sm">
            Create your shop identity. You will configure shipping and pickup
            next.
          </p>
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
                placeholder="e.g. Hanoi Archive"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-rewear-text placeholder:text-rewear-muted/60 min-h-11 w-full border-none bg-transparent text-base focus:outline-none"
              />
            </div>

            {/* Field: Shop URL · Read only */}
            <div className="border-rewear-border bg-rewear-soft/40 relative space-y-2 border p-4">
              <label
                htmlFor="shop-url-readonly"
                className="text-rewear-text block text-sm font-semibold"
              >
                Shop URL · Read only
              </label>
              <div className="flex items-center justify-between gap-3">
                <input
                  id="shop-url-readonly"
                  type="text"
                  readOnly
                  value={`rewear.vn/shops/${slug}`}
                  className="text-rewear-muted min-h-11 w-full border-none bg-transparent font-mono text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  title="Copy shop URL"
                  className="border-rewear-border text-rewear-text hover:bg-rewear-soft flex size-9 shrink-0 items-center justify-center border bg-white transition"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Field: About your shop */}
            <div className="bg-rewear-soft space-y-2 p-4">
              <label
                htmlFor={shopAboutInputId}
                className="text-rewear-text block text-sm font-semibold"
              >
                About your shop · optional
              </label>
              <textarea
                id={shopAboutInputId}
                rows={3}
                maxLength={1000}
                placeholder="Curated pre-owned clothing, based in Hanoi."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="text-rewear-text placeholder:text-rewear-muted/60 w-full resize-y border-none bg-transparent text-base focus:outline-none"
              />
            </div>

            {/* Upload Shop Logo placeholder */}
            <div className="flex items-center gap-4 py-2">
              <div className="border-rewear-border bg-rewear-text text-rewear-accent flex size-12 items-center justify-center rounded-full font-bold">
                {initials}
              </div>
              <span className="text-rewear-text text-sm font-semibold">
                Shop logo · Initials will be used by default
              </span>
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

          {/* Context Summary Card (Figma 63:2238) (5 cols) */}
          <aside className="bg-rewear-soft space-y-6 p-6 lg:col-span-5 xl:col-span-5">
            <h2 className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
              Your shop, at a glance
            </h2>

            {/* Shop Identity Card */}
            <div className="flex items-center gap-4">
              <div className="bg-rewear-text text-rewear-accent flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-bold">
                {initials}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-rewear-text truncate text-lg font-semibold">
                  {name.trim() || 'Hanoi Archive'}
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

            <p className="text-rewear-text border-rewear-border border-t pt-4 text-xs font-medium">
              Add a pickup address next to set up GHN shipping for your shop.
            </p>

            <button
              type="button"
              disabled={!name.trim() || createShop.isPending}
              onClick={handleSubmit}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 disabled:bg-rewear-border disabled:text-rewear-muted flex min-h-12 w-full items-center justify-center text-sm font-semibold transition disabled:cursor-not-allowed"
            >
              {createShop.isPending
                ? 'Creating shop…'
                : 'Continue to pickup address'}
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
