'use client';

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { Menu, X } from 'lucide-react';

export type SellerNavKey =
  | 'overview'
  | 'products'
  | 'orders'
  | 'returns'
  | 'funds'
  | 'settings'
  | 'messages';

interface SellerWorkspaceLayoutProps {
  children: React.ReactNode;
  activeNav?: SellerNavKey;
  onSelectNav?: (nav: SellerNavKey) => void;
  shopName?: string;
  shopLogo?: string | null;
}

const NAV_ITEMS: { key: SellerNavKey; label: string; href?: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'products', label: 'Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'returns', label: 'Returns' },
  { key: 'funds', label: 'Funds' },
  { key: 'settings', label: 'Shop settings' },
  { key: 'messages', label: 'Messages' },
];

export function SellerWorkspaceLayout({
  children,
  activeNav = 'products',
  onSelectNav,
  shopName = 'My shop',
  shopLogo,
}: SellerWorkspaceLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile Top App Bar */}
      <div className="border-rewear-border flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <Link href="/" className="flex items-center">
          <Image
            src="/brands/rewear-wordmark.svg"
            alt="RE.WEAR"
            width={91}
            height={16}
            className="h-auto w-[68px]"
            unoptimized
          />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold">{shopName}</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-rewear-border border p-1.5"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Sidebar: Figma 1:476 / 48:2075 */}
      <aside
        className={`border-rewear-border fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r bg-[#FAF9F6] p-6 transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          {/* Logo & Shop Subtitle */}
          <div className="space-y-3">
            <Link
              href="/"
              className="text-rewear-text block font-sans text-[22px] font-semibold tracking-tight"
            >
              RE.WEAR
            </Link>
            <p className="text-rewear-muted text-sm">{shopName}</p>
          </div>

          {/* Navigation Items: Figma 48:2075 */}
          <nav className="space-y-3" aria-label="Seller workspace">
            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              if (!onSelectNav)
                return (
                  <Link
                    key={item.key}
                    href={`/selling?tab=${item.key}`}
                    className="hover:bg-rewear-soft flex h-11 w-full items-center px-3 text-sm font-semibold"
                  >
                    {item.label}
                  </Link>
                );
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    onSelectNav?.(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex h-11 w-full items-center px-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? 'bg-rewear-accent text-rewear-text'
                      : 'text-rewear-text hover:bg-rewear-soft'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* View marketplace link: Figma 48:2088 */}
        <div className="pt-8">
          <Link
            href="/"
            className="text-rewear-text hover:text-rewear-muted inline-flex items-center gap-1.5 text-sm font-semibold transition"
          >
            View marketplace ↗
          </Link>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header: Figma 1:453 */}
        <header className="border-rewear-border flex h-16 items-center justify-end border-b px-6 sm:h-20 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Shop Profile */}
            <div className="flex items-center gap-2.5">
              <span className="text-rewear-text text-sm font-semibold">
                {shopName}
              </span>
              {shopLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shopLogo}
                  alt={shopName}
                  className="border-rewear-border size-8 rounded-full border object-cover"
                />
              ) : (
                <div className="bg-rewear-text text-rewear-accent flex size-8 items-center justify-center rounded-full text-xs font-bold">
                  {shopName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Slot */}
        <main className="flex-1 p-6 sm:p-8 lg:p-10">{children}</main>

        {/* Footer: Figma 48:982 / 53:1221 */}
        <footer className="border-rewear-border text-rewear-muted flex items-center justify-between border-t px-6 py-6 text-sm lg:px-8">
          <span>© 2026 RE.WEAR</span>
          <Link href="/help" className="hover:text-rewear-text hover:underline">
            Help & returns
          </Link>
        </footer>
      </div>
    </div>
  );
}
