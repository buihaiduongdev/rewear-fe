'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import {
  type AdminShopPayout,
  type PayoutStatus,
  shopFinanceApi,
} from '@/modules/shop-finance/shop-finance-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useToastStore } from '@/shared/stores/toast.store';
import { formatPrice } from '@/shared/utils/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileImage, ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';

import {
  FailPayoutModal,
  ReceiptPreviewModal,
  RecordTransferModal,
  RejectPayoutModal,
} from './AdminPayoutModals';

type StatusFilter = 'ALL' | 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'CLOSED';

const STATUS_STYLE: Record<PayoutStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  PROCESSING: 'bg-sky-50 text-sky-800',
  SUCCEEDED: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-rewear-soft text-rewear-muted',
  REJECTED: 'bg-red-50 text-red-700',
  FAILED: 'bg-red-50 text-red-700',
};

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SUCCEEDED', label: 'Completed' },
  { key: 'CLOSED', label: 'Failed / Rejected' },
];

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function AdminPayoutsPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const isAuthenticated = status === 'authenticated' && !session?.error;
  const isAdmin = isAuthenticated && session?.user?.role === 'ADMIN';

  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [transferTarget, setTransferTarget] = useState<AdminShopPayout | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<AdminShopPayout | null>(
    null,
  );
  const [failTarget, setFailTarget] = useState<AdminShopPayout | null>(null);

  const [previewPayout, setPreviewPayout] = useState<AdminShopPayout | null>(
    null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const payoutsQuery = useQuery({
    queryKey: ['admin-shop-payouts'],
    queryFn: () => shopFinanceApi.adminListPayouts(),
    enabled: isAdmin,
  });

  const refreshPayouts = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-shop-payouts'] });
  };

  const startMutation = useMutation({
    mutationFn: (payoutId: string) => shopFinanceApi.adminStartPayout(payoutId),
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Payout moved to processing',
        durationMs: 3500,
      });
      refreshPayouts();
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Could not start processing',
        description: getApiErrorMessage(err),
        durationMs: 5000,
      });
    },
  });

  const payouts = useMemo(
    () => payoutsQuery.data?.data.payouts ?? [],
    [payoutsQuery.data?.data.payouts],
  );

  const filteredPayouts = useMemo(() => {
    if (filter === 'ALL') return payouts;
    if (filter === 'CLOSED') {
      return payouts.filter((p) =>
        ['FAILED', 'REJECTED', 'CANCELLED'].includes(p.status),
      );
    }
    return payouts.filter((p) => p.status === filter);
  }, [payouts, filter]);

  const openReceiptPreview = async (payout: AdminShopPayout) => {
    setPreviewPayout(payout);
    setPreviewError(null);
    setPreviewUrl(payout.transferEvidenceUrl ?? null);
    if (!payout.transferEvidenceMediaId) return;

    setPreviewLoading(true);
    try {
      const res = await shopFinanceApi.adminGetPayoutReceipt(payout.id);
      setPreviewUrl(res.data.url);
    } catch (err) {
      if (!payout.transferEvidenceUrl) {
        setPreviewError(getApiErrorMessage(err));
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p role="status" className="text-rewear-muted text-sm">
          Loading admin workspace…
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Admin workspace</h1>
        <p className="text-rewear-muted mt-2 text-sm">
          Please{' '}
          <Link
            href="/login?callbackUrl=%2Fadmin%2Fpayouts"
            className="underline"
          >
            sign in
          </Link>{' '}
          with an admin account to review seller withdrawals.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-6 py-20 text-center">
        <div className="bg-rewear-soft mx-auto flex size-14 items-center justify-center rounded-full">
          <ShieldAlert size={24} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="text-rewear-muted text-sm">
          Your account does not have permission to manage seller payouts.
        </p>
        <Link
          href="/"
          className="bg-rewear-text inline-flex min-h-11 items-center px-5 text-sm font-semibold text-white"
        >
          Back to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-rewear-border flex w-full flex-col justify-between border-b bg-[#FAF9F6] p-6 lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="space-y-8">
          <div className="space-y-2">
            <Link
              href="/"
              className="text-rewear-text block text-[22px] font-semibold tracking-tight"
            >
              RE.WEAR
            </Link>
            <p className="text-rewear-muted text-sm">Admin workspace</p>
          </div>
          <nav aria-label="Admin workspace" className="space-y-2">
            <Link
              href="/admin/payouts"
              aria-current="page"
              className="bg-rewear-accent text-rewear-text flex h-11 items-center px-3 text-sm font-semibold"
            >
              Withdrawals
            </Link>
          </nav>
        </div>
        <div className="pt-8">
          <Link
            href="/"
            className="text-rewear-text hover:text-rewear-muted inline-flex items-center gap-1.5 text-sm font-semibold"
          >
            View marketplace ↗
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-rewear-border flex h-16 items-center justify-between border-b px-6 sm:h-20 lg:px-8">
          <span className="text-rewear-muted text-sm font-medium">
            Admin / Withdrawals
          </span>
          <span className="text-sm font-semibold">
            {session.user.fullName || 'Admin'}
          </span>
        </header>

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10">
          <div className="max-w-[960px] space-y-8">
            <div className="space-y-2">
              <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
                Withdrawals
              </h1>
              <p className="text-rewear-muted text-sm">
                Review seller payout requests, upload UNC bank transfer
                receipts, and reconcile transfer outcomes.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Filter withdrawals by status"
              className="border-rewear-border flex flex-wrap gap-2 border-b"
            >
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`min-h-11 px-4 text-sm font-semibold transition ${
                    filter === tab.key
                      ? 'border-rewear-text text-rewear-text border-b-2'
                      : 'text-rewear-muted hover:text-rewear-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {payoutsQuery.isPending ? (
              <p role="status" className="text-rewear-muted text-sm">
                Loading withdrawal requests…
              </p>
            ) : payoutsQuery.isError ? (
              <div
                role="alert"
                className="border-rewear-border space-y-3 border p-6"
              >
                <p className="text-sm">Could not load withdrawal requests.</p>
                <button
                  type="button"
                  onClick={() => void payoutsQuery.refetch()}
                  className="bg-rewear-text min-h-11 px-4 text-sm font-semibold text-white"
                >
                  Retry
                </button>
              </div>
            ) : filteredPayouts.length === 0 ? (
              <p className="border-rewear-border text-rewear-muted border p-6 text-sm">
                No withdrawal requests in this view.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredPayouts.map((payout) => (
                  <article
                    key={payout.id}
                    className="border-rewear-border space-y-4 border bg-white p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="font-mono text-sm font-semibold">
                            {payout.requestId}
                          </h2>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[payout.status]}`}
                          >
                            {payout.status}
                          </span>
                        </div>
                        <p className="text-rewear-muted text-xs">
                          Shop {payout.shopId.slice(0, 8)} · Requested{' '}
                          {formatDate(payout.createdAt)}
                        </p>
                      </div>
                      <p className="font-mono text-2xl font-semibold tabular-nums">
                        {formatPrice(payout.amount)}
                      </p>
                    </div>

                    <dl className="bg-rewear-soft grid gap-3 p-4 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="text-rewear-muted">
                          Bank &amp; account
                        </dt>
                        <dd className="mt-1 font-mono font-semibold">
                          {payout.recipientSnapshot.bankCode} ·{' '}
                          {payout.recipientSnapshot.accountNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-rewear-muted">Recipient</dt>
                        <dd className="mt-1 font-semibold">
                          {payout.recipientSnapshot.accountName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-rewear-muted">Bank reference</dt>
                        <dd className="mt-1 font-mono font-semibold">
                          {payout.bankReference ?? '—'}
                        </dd>
                      </div>
                    </dl>

                    {payout.reason && (
                      <p className="text-xs text-red-700">
                        Reason: {payout.reason}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {payout.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            disabled={startMutation.isPending}
                            onClick={() => startMutation.mutate(payout.id)}
                            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 px-4 text-sm font-semibold disabled:opacity-50"
                          >
                            Start processing
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectTarget(payout)}
                            className="border-rewear-border min-h-11 border px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {payout.status === 'PROCESSING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setTransferTarget(payout)}
                            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-11 px-4 text-sm font-semibold"
                          >
                            Record completed transfer
                          </button>
                          <button
                            type="button"
                            onClick={() => setFailTarget(payout)}
                            className="border-rewear-border min-h-11 border px-4 text-sm font-semibold text-red-700 hover:bg-red-50"
                          >
                            Mark failed / reconcile
                          </button>
                        </>
                      )}

                      {(payout.transferEvidenceMediaId ||
                        payout.transferEvidenceUrl) && (
                        <button
                          type="button"
                          onClick={() => void openReceiptPreview(payout)}
                          className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-semibold"
                        >
                          <FileImage size={16} aria-hidden="true" />
                          View UNC receipt
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </main>

        <footer className="border-rewear-border text-rewear-muted flex items-center justify-between border-t px-6 py-6 text-sm lg:px-8">
          <span>© 2026 RE.WEAR</span>
          <Link href="/" className="hover:text-rewear-text hover:underline">
            Marketplace
          </Link>
        </footer>
      </div>

      {transferTarget && (
        <RecordTransferModal
          payout={transferTarget}
          onClose={() => setTransferTarget(null)}
          onSuccess={() => {
            setTransferTarget(null);
            addToast({
              type: 'success',
              title: 'Transfer recorded',
              description: 'Seller payout has been marked as completed.',
              durationMs: 4000,
            });
            refreshPayouts();
          }}
        />
      )}

      {rejectTarget && (
        <RejectPayoutModal
          payout={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onSuccess={() => {
            setRejectTarget(null);
            addToast({
              type: 'info',
              title: 'Payout rejected',
              durationMs: 3500,
            });
            refreshPayouts();
          }}
        />
      )}

      {failTarget && (
        <FailPayoutModal
          payout={failTarget}
          onClose={() => setFailTarget(null)}
          onSuccess={() => {
            setFailTarget(null);
            addToast({
              type: 'info',
              title: 'Payout marked as failed',
              durationMs: 3500,
            });
            refreshPayouts();
          }}
        />
      )}

      {previewPayout && (
        <ReceiptPreviewModal
          payout={previewPayout}
          url={previewUrl}
          loading={previewLoading}
          error={previewError}
          onClose={() => {
            setPreviewPayout(null);
            setPreviewUrl(null);
            setPreviewError(null);
          }}
        />
      )}
    </div>
  );
}
