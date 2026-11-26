'use client';

import { useState } from 'react';

import { AdminWorkspaceLayout } from '@/features/admin/AdminWorkspaceLayout';
import { shortId } from '@/modules/disputes/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type { CodReconciliationControllerListParams } from '@/shared/api/models';
import {
  useCodReconciliationControllerList,
  useCodReconciliationControllerRefresh,
} from '@/shared/api/query-generated/cod-reconciliation/cod-reconciliation';
import { formatPrice } from '@/shared/utils/product';
import { Plus, RefreshCw } from 'lucide-react';

import {
  ReconciliationDetailModal,
  RecordCollectionModal,
  RecordRemittanceModal,
} from './AdminCodModals';

const PLATFORM_POLICIES = [
  {
    label: 'Buyer protection & escrow hold',
    value: '72 hours after delivery',
    detail:
      'Confirming receipt releases funds early without shortening the 72h issue reporting window.',
  },
  {
    label: 'Seller dispute response SLA',
    value: '1 business day',
    detail: 'Measured on Vietnam business days (ICT, Mon–Fri 17:00).',
  },
  {
    label: 'Admin dispute review SLA',
    value: '3–5 business days',
    detail:
      'Standard 3 business days; extendable once to 5 business days with a logged reason.',
  },
  {
    label: 'Reconsideration / appeal window',
    value: '2 business days',
    detail:
      'One-time appeal per decision before finalization; admin appeal review due in 2 business days.',
  },
  {
    label: 'Return parcel handover & KYC grace',
    value: '5 days handover · 30 days KYC grace',
    detail:
      'Approved returns require drop-off within 5 days; expired seller IDs get a 30-day renewal grace period.',
  },
];

export function AdminCodSettingsPage() {
  const [modeFilter, setModeFilter] = useState<
    'ALL' | 'EVIDENCE' | 'SIMULATION'
  >('ALL');
  const [inspectOrderId, setInspectOrderId] = useState<string | null>(null);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showRemitModal, setShowRemitModal] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const listParams: CodReconciliationControllerListParams =
    modeFilter === 'ALL' ? {} : { mode: modeFilter };

  const listQuery = useCodReconciliationControllerList(listParams, {
    query: { retry: false },
  });

  const refreshMutation = useCodReconciliationControllerRefresh({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: async () => {
        setFeedbackError('');
        setFeedbackSuccess('COD reconciliation status refreshed.');
        await listQuery.refetch();
      },
      onError: (err) => setFeedbackError(getApiErrorMessage(err)),
    },
  });

  const items = listQuery.data?.data ?? [];

  return (
    <AdminWorkspaceLayout activeNav="settings" title="COD & Settings">
      <div className="space-y-8">
        <div>
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em]">
            COD reconciliation &amp; system settings
          </h1>
          <p className="text-rewear-muted mt-1 text-sm">
            Reconcile carrier COD collections against bank remittances and
            review active platform policy parameters.
          </p>
        </div>

        {feedbackError && (
          <p
            role="alert"
            className="rounded-lg bg-[#BA1A1A]/10 p-3.5 text-sm text-[#BA1A1A]"
          >
            {feedbackError}
          </p>
        )}
        {feedbackSuccess && (
          <p
            role="status"
            className="bg-rewear-accent/40 text-rewear-text rounded-lg p-3.5 text-sm font-medium"
          >
            {feedbackSuccess}
          </p>
        )}

        {/* COD Reconciliation Section */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">COD reconciliations</h2>
              <div className="flex gap-1.5" role="tablist">
                {(['ALL', 'EVIDENCE', 'SIMULATION'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={modeFilter === mode}
                    onClick={() => setModeFilter(mode)}
                    className={`min-h-11 rounded-lg px-3 text-xs font-semibold ${
                      modeFilter === mode
                        ? 'bg-rewear-text text-white'
                        : 'bg-rewear-soft text-rewear-text'
                    }`}
                  >
                    {mode === 'ALL' ? 'All modes' : mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowCollectModal(true)}
                className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-1.5 rounded-lg border bg-white px-4 text-sm font-semibold"
              >
                <Plus size={15} />
                Record collection
              </button>
              <button
                type="button"
                onClick={() => setShowRemitModal(true)}
                className="bg-rewear-accent text-rewear-text inline-flex min-h-11 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold"
              >
                <Plus size={15} />
                Record remittance
              </button>
            </div>
          </div>

          <div className="border-rewear-border overflow-hidden rounded-lg border bg-white">
            {listQuery.isPending ? (
              <p role="status" className="text-rewear-muted p-6 text-sm">
                Loading COD reconciliations…
              </p>
            ) : listQuery.isError ? (
              <div role="alert" className="p-6 text-sm">
                <p>Could not load COD reconciliation records.</p>
                <button
                  type="button"
                  onClick={() => void listQuery.refetch()}
                  className="mt-2 min-h-11 font-semibold underline"
                >
                  Retry
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="text-rewear-muted p-6 text-sm">
                No COD collections have been recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-rewear-border bg-rewear-soft text-rewear-muted border-b text-xs font-semibold">
                    <tr>
                      <th className="px-4 py-3">Order / Waybill</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Collected</th>
                      <th className="px-4 py-3 text-right">Cash remitted</th>
                      <th className="px-4 py-3 text-right">Seller net</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-rewear-border divide-y">
                    {items.map((row) => (
                      <tr key={row.id} className="hover:bg-rewear-soft/40">
                        <td className="px-4 py-3.5">
                          <p className="font-mono text-xs font-bold">
                            #{shortId(row.orderId)}
                          </p>
                          <p className="text-rewear-muted font-mono text-xs">
                            {row.waybillCode} · {row.mode}
                          </p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                              row.status === 'FUNDED_HELD'
                                ? 'bg-rewear-accent text-rewear-text'
                                : row.status === 'REVIEW'
                                  ? 'bg-[#BA1A1A]/10 text-[#BA1A1A]'
                                  : 'bg-rewear-soft text-rewear-text'
                            }`}
                          >
                            {row.status}
                          </span>
                          {row.reviewReason && (
                            <p className="mt-1 text-[11px] text-[#BA1A1A]">
                              {row.reviewReason.replaceAll('_', ' ')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums">
                          {formatPrice(row.collectedAmount)}
                          <span className="text-rewear-muted block">
                            Exp. {formatPrice(row.expectedAmount)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums">
                          {formatPrice(row.cashReceived)}
                          <span className="text-rewear-muted block">
                            Fee {formatPrice(row.feeDeducted)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-xs font-bold tabular-nums">
                          {formatPrice(row.sellerNet)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectOrderId(row.orderId)}
                              className="min-h-11 text-xs font-semibold underline"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              aria-label={`Refresh order ${shortId(row.orderId)}`}
                              disabled={refreshMutation.isPending}
                              onClick={() =>
                                refreshMutation.mutate({
                                  id: row.orderId,
                                  data: {},
                                })
                              }
                              className="border-rewear-border hover:bg-rewear-soft inline-flex size-9 items-center justify-center rounded-lg border"
                            >
                              <RefreshCw size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Platform Policy Parameters (Read-only summary matching Figma 23) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">
              Platform policy parameters
            </h2>
            <p className="text-rewear-muted text-sm">
              Read-only reference of enforced escrow, SLA, and seller compliance
              windows.
            </p>
          </div>
          <div className="border-rewear-border divide-rewear-border divide-y rounded-lg border bg-white">
            {PLATFORM_POLICIES.map((policy) => (
              <div
                key={policy.label}
                className="flex flex-wrap items-start justify-between gap-4 p-5"
              >
                <div className="max-w-xl">
                  <h3 className="text-sm font-semibold">{policy.label}</h3>
                  <p className="text-rewear-muted mt-1 text-xs leading-5">
                    {policy.detail}
                  </p>
                </div>
                <span className="bg-rewear-soft rounded-lg px-3 py-1.5 font-mono text-xs font-bold">
                  {policy.value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {inspectOrderId && (
        <ReconciliationDetailModal
          orderId={inspectOrderId}
          onClose={() => setInspectOrderId(null)}
        />
      )}

      {showCollectModal && (
        <RecordCollectionModal
          onClose={() => setShowCollectModal(false)}
          onSaved={async () => {
            setShowCollectModal(false);
            setFeedbackSuccess('COD collection recorded.');
            await listQuery.refetch();
          }}
        />
      )}

      {showRemitModal && (
        <RecordRemittanceModal
          onClose={() => setShowRemitModal(false)}
          onSaved={async () => {
            setShowRemitModal(false);
            setFeedbackSuccess('Carrier COD remittance recorded.');
            await listQuery.refetch();
          }}
        />
      )}
    </AdminWorkspaceLayout>
  );
}
