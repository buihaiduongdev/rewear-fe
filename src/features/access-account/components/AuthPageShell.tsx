import type { ReactNode } from 'react';

import { DM_Sans } from 'next/font/google';
import Link from 'next/link';

import { AUTH_ROUTES } from '@/modules/auth/constants/route.constant';

const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], display: 'swap' });

export function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <main
      className={`${dmSans.className} flex min-h-dvh items-center justify-center bg-[#f9f9fb] px-4 py-8 text-[#1a1c1d] [--foreground:#1a1c1d] [--muted-foreground:#5f5e5e] max-[600px]:items-start max-[600px]:bg-white max-[600px]:p-0`}
    >
      <section
        className="flex w-full max-w-[520px] flex-col gap-6 bg-white p-8 max-[600px]:p-4 [&_a]:underline-offset-4 [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#1a1c1d] [&_a:hover]:underline [&_form_.mb-5]:mb-0 [&_form_div:has(>label)]:rounded-none [&_h1]:text-[28px] [&_h1]:leading-[34px] [&_h1]:font-semibold [&_h1]:tracking-[-0.56px] [&_p]:text-base [&_p]:leading-6 [&_p[id$='-error']]:text-xs [&_p[id$='-error']]:leading-[18px]"
        aria-label="Account access"
      >
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="inline-flex min-h-11 w-fit items-center text-sm leading-5 font-semibold min-[601px]:min-h-0"
          aria-label="Close and return to sign in"
        >
          Close ×
        </Link>
        {children}
      </section>
    </main>
  );
}
