'use client';

import { useMemo, useSyncExternalStore } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { useShopControllerFindMine } from '@/shared/api/query-generated/shops/shops';
import {
  ArrowUpRight,
  CheckCircle2,
  Package,
  Plus,
  ShieldCheck,
  Star,
  Store,
  Truck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

const MOCK_ORDERS = [
  {
    id: '#ORD-98214',
    title: 'Margiela Artisanal Coat',
    details: 'AW01 • Pristine [Archive]',
    buyerName: 'Julian V.',
    buyerCity: 'Zurich, CHE',
    amount: '2.850.000₫',
    status: 'Payment confirmed',
    sla: 'Dispatch within 14h',
    urgent: true,
  },
  {
    id: '#ORD-98203',
    title: 'Jil Sander Blazer',
    details: 'SS98 • Very Good [Inspected]',
    buyerName: 'Elenore K.',
    buyerCity: 'Paris, FRA',
    amount: '1.120.000₫',
    status: 'Payment confirmed',
    sla: 'Dispatch within 19h',
    urgent: true,
  },
  {
    id: '#ORD-98188',
    title: 'Helmut Lang Moto Jacket',
    details: '1999 • Vintage [Collector]',
    buyerName: 'Marcus N.',
    buyerCity: 'Berlin, DEU',
    amount: '3.400.000₫',
    status: 'Payment confirmed',
    sla: 'Dispatch within 22h',
    urgent: false,
  },
  {
    id: '#ORD-98174',
    title: 'Dries Van Noten Embroidered Bomber',
    details: 'SS04 • Excellent',
    buyerName: 'Kenji T.',
    buyerCity: 'Tokyo, JPN',
    amount: '4.200.000₫',
    status: 'Payment confirmed',
    sla: 'Dispatch within 24h',
    urgent: false,
  },
];

function getShopLogo(shopId: string): string | null {
  if (typeof window === 'undefined' || !shopId) return null;
  try {
    return localStorage.getItem(`rewear_shop_logo_${shopId}`);
  } catch {
    return null;
  }
}

function subscribeToStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

export function SellerDashboardPage() {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;

  const memberships = useShopControllerFindMine({
    query: {
      enabled,
      queryKey: ['pickup-shop-memberships', session?.user.id],
    },
  });

  const activeShop = useMemo(() => {
    return memberships.data?.data.find(
      (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
    );
  }, [memberships.data?.data]);

  const shopName = activeShop?.shop.name || 'Hanoi Archive';
  const shopId = activeShop?.shopId || '';

  const shopLogo = useSyncExternalStore(
    subscribeToStorage,
    () => getShopLogo(shopId),
    () => null,
  );

  // Zero State: User is authenticated but has no owned shop yet
  if (enabled && !memberships.isPending && !activeShop) {
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
          <span className="text-rewear-muted hidden sm:block">
            Seller workspace
          </span>
          <Link href="/" className="inline-flex min-h-11 items-center">
            Back to marketplace
          </Link>
        </header>

        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[640px] flex-col items-center justify-center px-4 py-20 text-center"
        >
          <div className="border-rewear-border w-full space-y-6 border p-8 md:p-12">
            <div className="bg-rewear-soft text-rewear-text mx-auto flex size-16 items-center justify-center rounded-full">
              <Store size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
                Start selling on RE.WEAR
              </h1>
              <p className="text-rewear-muted text-sm leading-6">
                You haven&apos;t set up a shop yet. Create your boutique
                identity and configure your pickup address to begin listing
                curated pieces.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/selling/open"
                className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full items-center justify-center text-sm font-semibold transition"
              >
                Open your shop
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="text-rewear-text min-h-dvh bg-[#FAF9F6]">
      {/* Navigation Header */}
      <header className="border-rewear-border bg-rewear-surface border-b">
        <div className="mx-auto flex min-h-20 w-full max-w-[1280px] items-center justify-between gap-6 px-4 text-sm leading-5 font-semibold md:px-8">
          <div className="flex items-center gap-8">
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
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/selling"
                className="border-rewear-text text-rewear-text flex min-h-11 items-center border-b-2"
              >
                Overview
              </Link>
              <Link
                href={
                  shopId
                    ? `/selling/pickup?shopId=${encodeURIComponent(shopId)}`
                    : '/selling/pickup'
                }
                className="text-rewear-muted hover:text-rewear-text flex min-h-11 items-center"
              >
                Pickup address
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-rewear-muted hover:text-rewear-text text-sm"
            >
              Back to marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] space-y-8 px-4 py-8 md:px-8"
      >
        {/* Section: Top Welcome & Operational Status Banner (Figma 1:1165) */}
        <section className="border-rewear-border relative flex flex-col justify-between gap-6 rounded-xl border bg-white p-6 shadow-xs md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-rewear-accent/40 text-rewear-text rounded px-1.5 py-0.5 font-mono">
                {shopId ? `NODE #${shopId.slice(0, 8)}` : 'NODE #BER-8024'}
              </span>
              <span className="text-rewear-text font-semibold">
                ● SELLER WORKSPACE
              </span>
              <span className="text-rewear-muted">UTC+07:00</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {shopLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shopLogo}
                  alt={shopName}
                  className="border-rewear-border size-10 rounded-full border object-cover"
                />
              ) : (
                <div className="bg-rewear-text text-rewear-accent flex size-10 items-center justify-center rounded-full text-sm font-bold">
                  {shopName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <h1 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] md:text-[32px]">
                {shopName}
              </h1>
              <span className="border-rewear-border bg-rewear-soft text-rewear-text inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                <ShieldCheck size={14} className="text-green-700" />
                VERIFIED BOUTIQUE
              </span>
            </div>

            <p className="text-rewear-muted text-xs">
              Track sales, inventory, and shipments in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={
                shopId
                  ? `/selling/pickup?shopId=${encodeURIComponent(shopId)}`
                  : '/selling/pickup'
              }
              className="border-rewear-border hover:bg-rewear-soft flex min-h-10 items-center gap-2 border bg-white px-4 text-xs font-semibold transition"
            >
              <Truck size={14} />
              Pickup Settings
            </Link>
            <Link
              href="/selling/new"
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-10 items-center gap-2 px-4 text-xs font-semibold transition"
            >
              <Plus size={14} />+ List New Archive Piece
            </Link>
          </div>
        </section>

        {/* Section: 4 Key Performance Metrics Cards (Figma 1:1194) */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Net Revenue */}
          <div className="border-rewear-border flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-rewear-muted text-xs font-semibold tracking-wider">
                NET REVENUE (MTD)
              </span>
              <p className="text-[28px] leading-9 font-semibold">18.450.000₫</p>
            </div>
            <div className="border-rewear-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                <ArrowUpRight size={14} /> +14.2%
              </span>
              <span className="text-rewear-muted">vs last month</span>
            </div>
          </div>

          {/* Card 2: Orders to Dispatch */}
          <div className="border-rewear-border flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-rewear-muted text-xs font-semibold tracking-wider">
                  ORDERS TO DISPATCH
                </span>
                <span className="size-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-[28px] leading-9 font-semibold">4 Urgent</p>
            </div>
            <div className="border-rewear-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
              <span className="bg-amber-100 px-1.5 py-0.5 text-amber-800">
                Awaiting label
              </span>
              <span className="text-rewear-muted font-medium">SLA &lt;18h</span>
            </div>
          </div>

          {/* Card 3: Active Listings */}
          <div className="border-rewear-border flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-rewear-muted text-xs font-semibold tracking-wider">
                ACTIVE LISTINGS
              </span>
              <p className="text-[28px] leading-9 font-semibold">48 Pieces</p>
            </div>
            <div className="border-rewear-border mt-4 space-y-1.5 border-t pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-rewear-muted">Sell-Through (30d)</span>
                <span className="font-semibold">92%</span>
              </div>
              <div className="bg-rewear-soft h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="bg-rewear-accent h-full"
                  style={{ width: '92%' }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Authenticity Pass */}
          <div className="border-rewear-border flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs">
            <div className="space-y-1">
              <span className="text-rewear-muted text-xs font-semibold tracking-wider">
                AUTHENTICITY PASS
              </span>
              <p className="text-[28px] leading-9 font-semibold">100%</p>
            </div>
            <div className="border-rewear-border mt-4 flex items-center justify-between border-t pt-3 text-xs">
              <span className="font-semibold text-green-700">
                GOLD STANDARD
              </span>
              <span className="text-rewear-muted">0 DISPUTES</span>
            </div>
          </div>
        </section>

        {/* Section: Main Workspace Layout (8 cols + 4 cols) (Figma 1:1269) */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Orders Awaiting Action (8 cols) */}
          <div className="space-y-6 lg:col-span-8">
            <div className="border-rewear-border overflow-hidden rounded-xl border bg-white shadow-xs">
              {/* Table Header / Action Banner */}
              <div className="border-rewear-border flex flex-wrap items-center justify-between gap-4 border-b p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                      Orders Awaiting Action
                    </h2>
                    <span className="bg-rewear-accent text-rewear-text rounded-full px-2 py-0.5 text-xs font-semibold">
                      4 PENDING
                    </span>
                  </div>
                  <p className="text-rewear-muted mt-1 text-xs">
                    Confirm seller orders and dispatch within the configured 24h
                    limit.
                  </p>
                </div>

                <Link
                  href="/selling/packages"
                  className="border-rewear-border hover:bg-rewear-soft flex items-center gap-1.5 border bg-white px-3 py-1.5 text-xs font-semibold"
                >
                  <Package size={13} />
                  Batch Labels (4)
                </Link>
              </div>

              {/* Responsive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-rewear-border bg-rewear-soft/60 text-rewear-muted border-b uppercase">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order / Item</th>
                      <th className="px-4 py-3 font-semibold">Buyer</th>
                      <th className="px-4 py-3 font-semibold">Amount</th>
                      <th className="px-4 py-3 font-semibold">SLA Window</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-rewear-border divide-y">
                    {MOCK_ORDERS.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-rewear-soft/30 transition"
                      >
                        <td className="px-5 py-4">
                          <span className="text-rewear-muted font-mono">
                            {order.id}
                          </span>
                          <p className="text-rewear-text font-semibold">
                            {order.title}
                          </p>
                          <span className="text-rewear-muted text-[11px]">
                            {order.details}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">{order.buyerName}</p>
                          <span className="text-rewear-muted text-[11px]">
                            {order.buyerCity}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">{order.amount}</p>
                          <span className="text-[11px] text-green-700">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block px-2 py-0.5 font-medium ${
                              order.urgent
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rewear-soft text-rewear-muted'
                            }`}
                          >
                            {order.sla}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href="/selling/packages"
                            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex items-center px-3 py-1.5 font-semibold transition"
                          >
                            Create label
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Scorecard & Quick Links (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            {/* Quality Scorecard (Figma 1:1600) */}
            <div className="border-rewear-border space-y-5 rounded-xl border bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Quality Scorecard</h3>
                <span className="bg-rewear-accent/40 text-rewear-text rounded px-2 py-0.5 text-xs font-semibold">
                  TIER 1
                </span>
              </div>

              {/* Rating header */}
              <div className="border-rewear-border flex items-center gap-4 border-b pb-4">
                <span className="text-3xl font-bold">4.9</span>
                <div className="space-y-1">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill="currentColor"
                        className="text-amber-500"
                      />
                    ))}
                  </div>
                  <p className="text-rewear-muted text-xs">
                    320 VERIFIED REVIEWS
                  </p>
                </div>
              </div>

              {/* Metric Breakdown */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-rewear-muted">Accurate Grading</span>
                    <span className="font-semibold">99.4%</span>
                  </div>
                  <div className="bg-rewear-soft h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-rewear-accent h-full"
                      style={{ width: '99.4%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-rewear-muted">
                      Packaging Integrity
                    </span>
                    <span className="font-semibold">100%</span>
                  </div>
                  <div className="bg-rewear-soft h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-rewear-accent h-full"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between">
                    <span className="text-rewear-muted">
                      SLA Dispatch Speed
                    </span>
                    <span className="font-semibold">98.1%</span>
                  </div>
                  <div className="bg-rewear-soft h-1.5 w-full overflow-hidden rounded-full">
                    <div
                      className="bg-rewear-accent h-full"
                      style={{ width: '98.1%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Escrow note */}
              <div className="border-rewear-border bg-rewear-soft/40 text-rewear-muted flex items-start gap-2 border p-3 text-xs">
                <CheckCircle2 size={15} className="shrink-0 text-green-700" />
                <span>
                  Funds unlock 72 hours after delivery, covered by RE.WEAR Buyer
                  & Seller Escrow Protection.
                </span>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="border-rewear-border space-y-3 rounded-xl border bg-white p-5 shadow-xs">
              <h3 className="font-semibold">Workspace Settings</h3>
              <div className="space-y-2 text-xs">
                <Link
                  href={
                    shopId
                      ? `/selling/pickup?shopId=${encodeURIComponent(shopId)}`
                      : '/selling/pickup'
                  }
                  className="hover:bg-rewear-soft border-rewear-border flex items-center justify-between border p-3 transition"
                >
                  <span className="font-medium">GHN Pickup Address</span>
                  <span className="text-rewear-muted">Manage →</span>
                </Link>
                <Link
                  href="/selling/packages"
                  className="hover:bg-rewear-soft border-rewear-border flex items-center justify-between border p-3 transition"
                >
                  <span className="font-medium">Listing Packages</span>
                  <span className="text-rewear-muted">Configure →</span>
                </Link>
                <Link
                  href="/selling/open"
                  className="hover:bg-rewear-soft border-rewear-border flex items-center justify-between border p-3 transition"
                >
                  <span className="font-medium">Shop Details</span>
                  <span className="text-rewear-muted">View →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
