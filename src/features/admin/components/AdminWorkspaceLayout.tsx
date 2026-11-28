'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu, ShieldAlert, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

export type AdminNavKey =
  'products' | 'categories' | 'disputes' | 'users' | 'payouts' | 'settings';

const ADMIN_NAV_ITEMS: Array<{
  key: AdminNavKey;
  label: string;
  href: string;
}> = [
  { key: 'products', label: 'Product moderation', href: '/admin/products' },
  { key: 'categories', label: 'Categories', href: '/admin/categories' },
  { key: 'disputes', label: 'Disputes', href: '/admin/disputes' },
  { key: 'users', label: 'Users & shops', href: '/admin/users' },
  { key: 'payouts', label: 'Payouts', href: '/admin/payouts' },
  { key: 'settings', label: 'Settings', href: '/admin/settings' },
];

interface AdminWorkspaceLayoutProps {
  children: React.ReactNode;
  activeNav: AdminNavKey;
}

export function AdminWorkspaceLayout({
  children,
  activeNav,
}: AdminWorkspaceLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (status === 'loading') {
    return (
      <div
        role="status"
        className="bg-rewear-surface text-rewear-muted flex min-h-dvh items-center justify-center text-sm"
      >
        Loading admin workspace…
      </div>
    );
  }

  if (status !== 'authenticated' || !session?.user || session.error) {
    const callbackUrl = encodeURIComponent(pathname || '/admin/products');
    return (
      <main className="bg-rewear-surface text-rewear-text flex min-h-dvh items-center justify-center p-6">
        <div className="border-rewear-border w-full max-w-md space-y-4 rounded-[8px] border p-8">
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">
            Sign in required
          </h1>
          <p className="text-rewear-muted text-sm leading-relaxed">
            Sign in with an administrator account to access the RE.WEAR admin
            workspace.
          </p>
          <Link
            href={`/login?callbackUrl=${callbackUrl}`}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 w-full items-center justify-center rounded-[8px] px-4 text-sm font-semibold transition"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <main className="bg-rewear-surface text-rewear-text flex min-h-dvh items-center justify-center p-6">
        <div
          role="alert"
          className="border-rewear-border w-full max-w-md space-y-4 rounded-[8px] border p-8"
        >
          <div className="flex items-center gap-2.5 text-[#BA1A1A]">
            <ShieldAlert size={20} aria-hidden="true" />
            <h1 className="text-rewear-text text-2xl font-semibold tracking-[-0.02em]">
              Admin access required
            </h1>
          </div>
          <p className="text-rewear-muted text-sm leading-relaxed">
            Your account does not have administrator permission to view this
            workspace.
          </p>
          <Link
            href="/"
            className="border-rewear-border text-rewear-text hover:bg-rewear-soft inline-flex min-h-11 w-full items-center justify-center rounded-[8px] border px-4 text-sm font-semibold transition"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    );
  }

  const displayName = session.user.fullName || session.user.email || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col lg:flex-row">
      {/* Mobile Top Bar */}
      <div className="border-rewear-border flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <Link
          href="/admin/products"
          className="text-rewear-text font-sans text-lg font-semibold tracking-tight"
        >
          RE.WEAR
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-rewear-muted text-xs font-semibold">
            Admin workspace
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="border-rewear-border flex min-h-11 min-w-11 items-center justify-center rounded-[8px] border"
            aria-label="Toggle admin navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Fixed 256px Left Sidebar — matches Figma Admin Aside */}
      <aside
        className={`border-rewear-border fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between border-r bg-[#FAF9F6] p-6 transition-transform lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          <div className="space-y-2">
            <Link
              href="/"
              className="text-rewear-text block font-sans text-[22px] font-semibold tracking-tight"
            >
              RE.WEAR
            </Link>
            <p className="text-rewear-muted text-sm">Admin workspace</p>
          </div>

          <nav className="space-y-2" aria-label="Admin workspace">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-11 w-full items-center rounded-[8px] px-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-rewear-accent text-rewear-text'
                      : 'text-rewear-text hover:bg-rewear-soft'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="text-rewear-text hover:text-rewear-muted inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold transition"
          >
            View marketplace ↗
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
        />
      )}

      {/* Right Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-rewear-border flex h-16 items-center justify-end border-b px-6 sm:h-20 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="border-rewear-border bg-rewear-soft text-rewear-muted rounded-[8px] border px-2.5 py-1 text-xs font-semibold">
              ADMIN
            </span>
            <span className="text-rewear-text text-sm font-semibold">
              {displayName}
            </span>
            <div className="bg-rewear-text text-rewear-accent flex size-8 items-center justify-center rounded-full text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1024px] flex-1 p-6 sm:p-8">
          {children}
        </main>

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
