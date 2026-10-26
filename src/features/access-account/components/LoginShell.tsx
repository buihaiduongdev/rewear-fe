import type { ReactNode } from 'react';

import { DM_Sans } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

import { Search } from 'lucide-react';

const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap' });

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${dmSans.className} min-h-dvh bg-white text-[#1a1c1d] [--foreground:#1a1c1d] [--muted-foreground:#5f5e5e] [&_a]:underline-offset-4 [&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-[5px] [&_a:focus-visible]:outline-[#1a1c1d] [&_a:hover]:underline`}
    >
      <header className="flex h-20 items-center gap-10 px-12 text-sm leading-5 font-semibold max-[1150px]:gap-6 max-[1150px]:px-8 max-[767px]:h-[72px] max-[767px]:justify-between max-[767px]:px-6">
        <Link
          href="/"
          aria-label="RE.WEAR home"
          className="text-[22px] leading-7 tracking-[-0.44px] whitespace-nowrap"
        >
          RE.WEAR
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex min-w-[120px] items-center gap-6 whitespace-nowrap max-[767px]:hidden"
        >
          <Link href="/">Shop</Link>
          <Link href="/register">Sell</Link>
        </nav>
        <div
          className="flex h-[46px] max-w-[360px] min-w-[180px] flex-1 items-center gap-3 rounded-lg bg-[#f3f3f5] px-4 font-normal text-[#5f5e5e] max-[1150px]:hidden"
          aria-hidden="true"
        >
          <Search size={18} strokeWidth={1.5} />
          <span>Search clothing, brands…</span>
        </div>
        <div className="ml-auto flex items-center gap-6 whitespace-nowrap max-[767px]:hidden">
          <span aria-disabled="true">Messages</span>
          <span aria-disabled="true">Cart</span>
          <Link href="/login" aria-current="page">
            Account
          </Link>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <span lang="en">EN</span>
          <span lang="vi">VI</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-[1536px] items-center gap-16 p-12 max-[1150px]:gap-10 max-[1150px]:p-8 max-[767px]:min-h-[620px] max-[767px]:px-6 max-[767px]:pt-10 max-[767px]:pb-16">
        <div className="relative h-[760px] min-w-0 flex-1 max-[1150px]:h-[680px] max-[767px]:hidden">
          <Image
            src="/images/login-editorial.png"
            alt=""
            fill
            preload
            sizes="(max-width: 767px) 1px, (max-width: 1279px) 48vw, 608px"
            className="object-cover"
          />
        </div>
        <section
          className="flex w-[512px] shrink-0 flex-col gap-6 max-[1150px]:w-[44%] max-[767px]:mx-auto max-[767px]:w-full max-[767px]:max-w-[512px]"
          aria-label="Sign in to RE.WEAR"
        >
          {children}
        </section>
      </main>
      <footer className="bg-[#f3f3f5] p-12 max-[1150px]:px-8 max-[1150px]:py-10 max-[767px]:px-6 max-[767px]:py-8">
        <div className="flex justify-between gap-8 max-[767px]:flex-col max-[767px]:gap-10">
          <div>
            <Link
              href="/"
              className="text-[40px] leading-[46px] font-semibold tracking-[-0.8px] max-[767px]:text-[32px] max-[767px]:leading-10"
            >
              RE.WEAR
            </Link>
            <p className="mt-6 text-base leading-6 max-[767px]:mt-4">
              Pre-owned clothing.
              <br />
              Ready for its next owner.
            </p>
          </div>
          <div className="flex w-44 flex-col gap-4 text-sm leading-5 [&_p]:font-semibold">
            <p>Help</p>
            <span>Buying &amp; returns</span>
            <span>Privacy policy</span>
            <span>Terms of service</span>
          </div>
        </div>
        <div className="mt-12 flex justify-between gap-8 text-sm leading-5 font-semibold text-[#5f5e5e] max-[767px]:mt-10 max-[767px]:flex-wrap max-[767px]:gap-6">
          <p>© 2026 RE.WEAR</p>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span lang="en">English</span>
            <span lang="vi">Tiếng Việt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
