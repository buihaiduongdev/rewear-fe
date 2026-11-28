'use client';

import * as React from 'react';

import Link from 'next/link';

import {
  PolicyModals,
  type PolicyModalType,
} from '@/shared/components/marketplace/PolicyModals';
import { Menu, ShieldAlert, X } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

export type AdminNavKey =
  'products' | 'categories' | 'disputes' | 'users' | 'payouts' | 'settings';

const ADMIN_NAV_ITEMS: { key: AdminNavKey; label: string; href: string }[] = [
  { key: 'products', label: 'Moderation', href: '/admin/products' },
  { key: 'categories', label: 'Categories', href: '/admin/categories' },
  { key: 'disputes', label: 'Disputes', href: '/admin/disputes' },
  { key: 'users', label: 'Users & Shops', href: '/admin/users' },
  { key: 'payouts', label: 'Withdrawals', href: '/admin/payouts' },
  { key: 'settings', label: 'COD & Settings', href: '/admin/settings' },
];

interface AdminWorkspaceLayoutProps {
  activeNav: AdminNavKey;
  title: string;
  children: React.ReactNode;
}

export function AdminWorkspaceLayout({
  activeNav,
  title,
  children,
}: AdminWorkspaceLayoutProps) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [policyModal, setPolicyModal] = React.useState<PolicyModalType>(null);

  if (status === 'loading') {
    return (
      <div className="bg-rewear-surface text-rewear-text flex min-h-dvh items-center justify-center p-8">
        <p className="text-rewear-muted text-sm" role="status">
          Loading admin workspace…
        </p>
      </div>
    );
  }

  if (!session?.user || session.error) {
    return (
      <div className="bg-rewear-surface text-rewear-text flex min-h-dvh items-center justify-center p-6">
        <div className="border-rewear-border w-full max-w-md space-y-4 border bg-white p-8">
          <h1 className="text-2xl font-semibold">Sign in required</h1>
          <p className="text-rewear-muted text-sm">
            Sign in with an administrator account to access the RE.WEAR admin
            workspace.
          </p>
          <Link
            href="/login"
            className="bg-rewear-accent text-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="bg-rewear-surface text-rewear-text flex min-h-dvh items-center justify-center p-6">
        <div
          role="alert"
          className="border-rewear-border w-full max-w-md space-y-4 border bg-white p-8"
        >
          <div className="bg-rewear-soft text-rewear-text inline-flex size-11 items-center justify-center rounded-lg">
            <ShieldAlert size={20} />
          </div>
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-rewear-muted text-sm leading-6">
            Your account does not have administrator permissions to view this
            workspace.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/"
              className="bg-rewear-accent text-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold"
            >
              Back to marketplace
            </Link>
            <Link
              href="/selling"
              className="border-rewear-border inline-flex min-h-11 items-center border px-5 text-sm font-semibold"
            >
              Seller workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const adminName = session.user.fullName || session.user.email || 'Admin';

  return (
    <div className="text-rewear-text flex min-h-dvh flex-col bg-[#F9F9FB] lg:flex-row">
      {/* Mobile Header */}
      <div className="border-rewear-border bg-rewear-surface flex h-16 items-center justify-between border-b px-4 lg:hidden">
        <Link href="/admin/disputes" className="text-lg font-semibold">
          RE.WEAR
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-rewear-muted text-xs font-medium">
            Admin workspace
          </span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="border-rewear-border inline-flex size-11 items-center justify-center rounded-lg border"
            aria-label="Toggle admin navigation"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Fixed 256px Left Aside */}
      <aside
        className={`border-rewear-border bg-rewear-surface fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col justify-between border-r p-6 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-8">
          <div className="space-y-1.5">
            <Link
              href="/admin/disputes"
              className="text-rewear-text block font-sans text-[22px] font-semibold tracking-tight"
            >
              RE.WEAR
            </Link>
            <p className="text-rewear-muted text-sm">Admin workspace</p>
          </div>

          <nav className="space-y-1.5" aria-label="Admin workspace">
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-11 w-full items-center rounded-lg px-3 text-sm font-semibold transition-colors ${
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

        <div className="border-rewear-border border-t pt-6">
          <Link
            href="/"
            className="text-rewear-text hover:text-rewear-muted inline-flex min-h-11 items-center text-sm font-semibold transition-colors"
          >
            View marketplace ↗
          </Link>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Right Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-rewear-border bg-rewear-surface sticky top-0 z-20 flex h-16 items-center justify-between border-b px-6 sm:h-20 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-rewear-muted hidden sm:inline">Admin /</span>
            <span className="font-semibold">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-rewear-text hidden text-sm font-semibold sm:inline">
              {adminName}
            </span>
            <div className="bg-rewear-text text-rewear-accent flex size-8 items-center justify-center rounded-full font-mono text-xs font-bold">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => void signOut({ redirectTo: '/' })}
              className="text-rewear-muted hover:text-rewear-text min-h-11 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[960px] flex-1 px-6 py-8 sm:px-8">
          {children}
        </main>

        <footer className="border-rewear-border bg-rewear-surface text-rewear-muted flex h-20 items-center justify-between border-t px-6 text-sm lg:px-8">
          <span>© 2026 RE.WEAR</span>
          <button
            type="button"
            onClick={() => setPolicyModal('help')}
            className="hover:text-rewear-text min-h-11 cursor-pointer underline-offset-4 hover:underline"
          >
            Help &amp; returns
          </button>
        </footer>
      </div>

      <PolicyModals
        openType={policyModal}
        onClose={() => setPolicyModal(null)}
      />
    </div>
  );
}
