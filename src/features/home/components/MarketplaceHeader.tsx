'use client';

import { useRef, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { signOut, useSession } from 'next-auth/react';

export function MarketplaceHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (value: string) => void;
}) {
  const { data: session } = useSession();
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileInput = useRef<HTMLInputElement>(null);

  const searchForm = (mobile: boolean) => (
    <form
      role="search"
      aria-label={mobile ? 'Search clothing on mobile' : 'Search clothing'}
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSearch(String(form.get('search') ?? '').trim());
        if (mobile) setSearchOpen(false);
      }}
      className={
        mobile
          ? 'bg-rewear-soft flex h-[46px] w-full items-center px-3.5'
          : 'bg-rewear-soft hidden h-[46px] w-[360px] shrink items-center px-3.5 lg:flex'
      }
    >
      <input
        key={search}
        ref={mobile ? mobileInput : undefined}
        type="search"
        name="search"
        maxLength={150}
        defaultValue={search}
        placeholder="Search clothing, brands…"
        aria-label="Search clothing and brands"
        className="placeholder:text-rewear-muted w-full min-w-0 bg-transparent text-sm leading-5 font-normal outline-none"
      />
      <button type="submit" className="sr-only focus:not-sr-only">
        Search
      </button>
    </form>
  );

  return (
    <>
      <a
        href="#main-content"
        className="bg-rewear-accent fixed top-2 left-4 z-50 -translate-y-20 px-4 py-3 text-sm focus:translate-y-0"
      >
        Skip to content
      </a>
      <header className="mx-auto flex h-16 w-full max-w-[1536px] items-center justify-between gap-4 px-4 text-sm leading-5 font-semibold md:h-20 md:gap-6 md:px-12">
        <Link
          href="/"
          aria-label="RE.WEAR home"
          className="flex min-h-11 w-[106px] shrink-0 items-center md:w-auto"
        >
          <Image
            src="/brands/rewear-wordmark.svg"
            alt="RE.WEAR"
            width={91}
            height={16}
            className="h-auto w-[60px] md:w-[94px]"
            unoptimized
          />
        </Link>
        <a
          href="#new-arrivals"
          className="hidden min-h-11 items-center hover:underline md:inline-flex"
        >
          Explore
        </a>
        {searchForm(false)}
        <button
          type="button"
          aria-expanded={searchOpen}
          aria-controls="mobile-search"
          className="min-h-11 w-[90px] cursor-pointer text-left lg:hidden"
          onClick={() => {
            setSearchOpen(!searchOpen);
            requestAnimationFrame(() => mobileInput.current?.focus());
          }}
        >
          Search
        </button>
        <nav
          aria-label="Account navigation"
          className="hidden items-center gap-6 whitespace-nowrap md:flex"
        >
          <button type="button" disabled title="Messages are coming soon">
            Messages
          </button>
          <button type="button" disabled title="Your cart is coming soon">
            Cart
          </button>
          {session ? (
            <details className="relative">
              <summary className="flex min-h-11 cursor-pointer list-none items-center">
                Account
              </summary>
              <div className="bg-rewear-surface border-rewear-border absolute top-full right-0 z-20 min-w-48 border p-4 shadow-sm">
                <p className="mb-3 max-w-48 truncate">
                  {session.user.fullName}
                </p>
                <button
                  type="button"
                  className="min-h-11 cursor-pointer underline underline-offset-4"
                  onClick={() => void signOut({ redirectTo: '/' })}
                >
                  Sign out
                </button>
              </div>
            </details>
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center hover:underline"
            >
              Account
            </Link>
          )}
          <span>
            <span lang="en">EN</span> / <span lang="vi">VI</span>
          </span>
        </nav>
        <button
          type="button"
          disabled
          title="Orders are coming soon"
          className="min-h-11 w-[90px] text-left md:hidden"
        >
          Orders
        </button>
      </header>
      <div
        id="mobile-search"
        hidden={!searchOpen}
        className="px-4 pb-4 lg:hidden"
      >
        {searchForm(true)}
      </div>
    </>
  );
}
