'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { formatIctDateTime, shortId } from '@/modules/disputes/api';
import {
  createIdentityRenewal,
  createShopApplication,
  getGraceStatus,
  getMyApplicationDetail,
  KYC_STATE_LABELS,
  listMyApplications,
  listShopBankAccounts,
  openApplicationDocumentDownload,
} from '@/modules/kyc/api';
import { useShopMemberships } from '@/modules/shop/hooks/use-shop-memberships';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  IdCard,
  ShieldCheck,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

import { SellerKycForm } from './SellerKycForm';
import { SellerWorkspaceLayout } from './SellerWorkspaceLayout';

export function SellerKycPage() {
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const memberships = useShopMemberships(enabled, session?.user.id);

  const activeShop = useMemo(
    () =>
      memberships.data?.data.find(
        (m) => m.memberRole === 'OWNER' && m.status === 'ACTIVE',
      ),
    [memberships.data?.data],
  );
  const shopId = activeShop?.shopId ?? '';
  const shopName = activeShop?.shop.name ?? 'Seller workspace';

  const appsQuery = useQuery({
    queryKey: ['seller-kyc-applications', session?.user.id],
    queryFn: () => listMyApplications({ limit: 20, offset: 0 }),
    enabled: enabled && Boolean(shopId),
    retry: false,
  });

  const shopApps = useMemo(
    () => (appsQuery.data?.data.items ?? []).filter((a) => a.shopId === shopId),
    [appsQuery.data?.data.items, shopId],
  );

  const latestApp = shopApps[0] ?? null;

  const detailQuery = useQuery({
    queryKey: ['seller-kyc-detail', latestApp?.id],
    queryFn: () => getMyApplicationDetail(latestApp!.id),
    enabled: enabled && Boolean(latestApp?.id),
    retry: false,
  });

  const bankAccountsQuery = useQuery({
    queryKey: ['seller-bank-accounts', shopId],
    queryFn: () => listShopBankAccounts(shopId),
    enabled: enabled && Boolean(shopId),
    retry: false,
  });

  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const detail = detailQuery.data?.data ?? null;
  const accounts = bankAccountsQuery.data?.data.accounts ?? [];

  const handleFeedback = (type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      setFeedbackError('');
      setFeedbackSuccess(message);
    } else {
      setFeedbackSuccess('');
      setFeedbackError(message);
    }
  };

  const startAppMutation = useMutation({
    mutationFn: (kind: 'INITIAL' | 'RENEWAL') =>
      kind === 'INITIAL'
        ? createShopApplication(shopId)
        : createIdentityRenewal(shopId),
    onSuccess: async () => {
      handleFeedback(
        'success',
        'KYC draft created. Upload your ID document below.',
      );
      await appsQuery.refetch();
    },
    onError: (err) => handleFeedback('error', getApiErrorMessage(err)),
  });

  const graceInfo = getGraceStatus(detail?.identity?.expiresOn);
  const canEdit =
    detail && (detail.state === 'DRAFT' || detail.state === 'NEEDS_INFO');

  return (
    <SellerWorkspaceLayout activeNav="settings" shopName={shopName}>
      <div className="mx-auto max-w-[960px] space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/selling"
              className="text-rewear-muted hover:text-rewear-text text-sm font-semibold hover:underline"
            >
              ← Back to seller workspace
            </Link>
            <h1 className="mt-2 text-[28px] leading-[36px] font-semibold tracking-[-0.02em]">
              Identity verification (KYC)
            </h1>
            <p className="text-rewear-muted mt-1 text-sm">
              Verify your CCCD or Passport to unlock payouts and maintain active
              selling privileges.
            </p>
          </div>
          {detail && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                detail.state === 'APPROVED'
                  ? 'bg-rewear-accent text-rewear-text'
                  : detail.state === 'REJECTED' || detail.state === 'NEEDS_INFO'
                    ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                    : 'bg-rewear-soft text-rewear-text'
              }`}
            >
              <ShieldCheck size={14} />
              {KYC_STATE_LABELS[detail.state]}
            </span>
          )}
        </div>

        {!shopId ? (
          <div className="border-rewear-border rounded-lg border bg-white p-6 text-sm">
            {memberships.isPending ? (
              <p role="status">Loading shop membership…</p>
            ) : (
              <p>
                Open an active shop first before submitting owner identity
                verification.
              </p>
            )}
          </div>
        ) : (
          <>
            {feedbackError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg bg-[#BA1A1A]/10 p-4 text-sm text-[#BA1A1A]"
              >
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{feedbackError}</span>
              </div>
            )}
            {feedbackSuccess && (
              <div
                role="status"
                className="bg-rewear-accent/40 text-rewear-text flex items-center gap-2 rounded-lg p-4 text-sm font-medium"
              >
                <CheckCircle2 size={16} />
                <span>{feedbackSuccess}</span>
              </div>
            )}

            {/* 30-Day Grace & Renewal Status Card */}
            {graceInfo && (
              <section
                className={`rounded-lg border p-5 ${
                  graceInfo.tone === 'danger'
                    ? 'border-[#BA1A1A]/40 bg-[#BA1A1A]/5'
                    : graceInfo.tone === 'warning'
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-rewear-border bg-white'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold">
                      {graceInfo.label}
                    </h2>
                    <p className="text-rewear-muted mt-1 text-sm">
                      {graceInfo.detail}
                    </p>
                  </div>
                  {detail?.state === 'APPROVED' && (
                    <button
                      type="button"
                      disabled={startAppMutation.isPending}
                      onClick={() => startAppMutation.mutate('RENEWAL')}
                      className="bg-rewear-text min-h-11 rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {startAppMutation.isPending
                        ? 'Starting…'
                        : 'Start identity renewal'}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Start KYC Zero State */}
            {!latestApp && !appsQuery.isPending && (
              <section className="border-rewear-border space-y-4 rounded-lg border bg-white p-8">
                <div className="bg-rewear-soft inline-flex size-12 items-center justify-center rounded-lg">
                  <IdCard size={22} />
                </div>
                <h2 className="text-xl font-semibold">
                  Verify shop owner identity
                </h2>
                <p className="text-rewear-muted max-w-xl text-sm leading-6">
                  Prepare a clear photo of your 12-digit Vietnam National ID
                  (CCCD front &amp; back) or valid Passport, plus your confirmed
                  shop payout bank account.
                </p>
                <button
                  type="button"
                  disabled={startAppMutation.isPending}
                  onClick={() => startAppMutation.mutate('INITIAL')}
                  className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
                >
                  {startAppMutation.isPending
                    ? 'Creating draft…'
                    : 'Start KYC verification'}
                </button>
              </section>
            )}

            {/* Current Application Summary */}
            {detail && (
              <section className="border-rewear-border space-y-5 rounded-lg border bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {detail.kind === 'RENEWAL'
                        ? 'Identity renewal application'
                        : 'Initial owner KYC application'}
                    </h2>
                    <p className="text-rewear-muted font-mono text-xs">
                      APP #{shortId(detail.id)} · Updated{' '}
                      {formatIctDateTime(detail.updatedAt)}
                    </p>
                  </div>
                  {detail.state === 'REJECTED' && (
                    <button
                      type="button"
                      disabled={startAppMutation.isPending}
                      onClick={() => startAppMutation.mutate(detail.kind)}
                      className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-4 text-sm font-semibold"
                    >
                      Start new submission
                    </button>
                  )}
                </div>

                {detail.reason && (
                  <div className="bg-rewear-soft rounded-lg p-4 text-sm">
                    <p className="text-rewear-muted text-xs font-semibold">
                      Reviewer note
                    </p>
                    <p className="mt-1">{detail.reason}</p>
                  </div>
                )}

                {canEdit ? (
                  <SellerKycForm
                    key={`${detail.id}:${detail.updatedAt}`}
                    shopId={shopId}
                    detail={detail}
                    accounts={accounts}
                    onFeedback={handleFeedback}
                    onRefresh={async () => {
                      await Promise.all([
                        appsQuery.refetch(),
                        detailQuery.refetch(),
                        bankAccountsQuery.refetch(),
                      ]);
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {detail.identity && (
                      <dl className="grid gap-4 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-rewear-muted text-xs">
                            Document
                          </dt>
                          <dd className="mt-0.5 font-semibold">
                            {detail.identity.documentType === 'NATIONAL_ID'
                              ? 'CCCD (National ID)'
                              : 'Passport'}{' '}
                            ·{' '}
                            <span className="font-mono">
                              {detail.identity.documentNumber}
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-rewear-muted text-xs">
                            Full name
                          </dt>
                          <dd className="mt-0.5 font-semibold">
                            {detail.identity.fullName}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-rewear-muted text-xs">
                            Expires on
                          </dt>
                          <dd className="mt-0.5 font-mono">
                            {detail.identity.expiresOn}
                          </dd>
                        </div>
                      </dl>
                    )}

                    {detail.documents.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold">
                          Identity document photos ({detail.documents.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {detail.documents.map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() =>
                                void openApplicationDocumentDownload(
                                  doc.id,
                                ).catch((err) =>
                                  handleFeedback(
                                    'error',
                                    getApiErrorMessage(err),
                                  ),
                                )
                              }
                              className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
                            >
                              <FileUp size={14} />
                              {doc.slot} ({Math.round(doc.sizeBytes / 1024)} KB)
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </SellerWorkspaceLayout>
  );
}
