'use client';

import { useState } from 'react';

import {
  type PayoutStatus,
  type ShopBankAccount,
  shopFinanceApi,
  type ShopFinanceSummary,
} from '@/modules/shop-finance/shop-finance-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useShopFinanceControllerView } from '@/shared/api/query-generated/shop-finance/shop-finance';
import { useToastStore } from '@/shared/stores/toast.store';
import { formatPrice } from '@/shared/utils/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, HelpCircle, Plus, Trash2 } from 'lucide-react';

import {
  AddBankAccountModal,
  maskAccountNumber,
  RequestWithdrawalModal,
  SettlementInfoModal,
} from './SellerFundsModals';

const STATUS_BADGE_STYLES: Record<PayoutStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800',
  PROCESSING: 'bg-sky-50 text-sky-800',
  SUCCEEDED: 'bg-emerald-50 text-emerald-800',
  CANCELLED: 'bg-rewear-soft text-rewear-muted',
  REJECTED: 'bg-red-50 text-red-700',
  FAILED: 'bg-red-50 text-red-700',
};

const STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SUCCEEDED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
  FAILED: 'Failed',
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function SellerFundsSection({
  shopId,
  enabled,
}: {
  shopId: string;
  enabled: boolean;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [bankOpen, setBankOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const financeQuery = useShopFinanceControllerView(shopId, undefined, {
    query: {
      enabled: Boolean(enabled && shopId),
      queryKey: ['seller-finance', shopId],
    },
  });

  const payoutsQuery = useQuery({
    queryKey: ['seller-payouts', shopId],
    queryFn: () => shopFinanceApi.getOwnerPayouts(shopId),
    enabled: Boolean(enabled && shopId),
  });

  const invalidateAll = () => {
    void queryClient.invalidateQueries({
      queryKey: ['seller-finance', shopId],
    });
    void queryClient.invalidateQueries({
      queryKey: ['seller-payouts', shopId],
    });
  };

  const cancelPayoutMutation = useMutation({
    mutationFn: (payoutId: string) =>
      shopFinanceApi.cancelPayout(shopId, payoutId),
    onSuccess: () => {
      addToast({
        type: 'info',
        title: 'Withdrawal cancelled',
        description:
          'Reserved funds have been returned to your available balance.',
        durationMs: 4000,
      });
      invalidateAll();
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Could not cancel withdrawal',
        description: getApiErrorMessage(err),
        durationMs: 5000,
      });
    },
  });

  const deleteBankMutation = useMutation({
    mutationFn: (accountId: string) =>
      shopFinanceApi.deleteBankAccount(shopId, accountId),
    onSuccess: () => {
      setConfirmRemoveId(null);
      addToast({
        type: 'info',
        title: 'Bank account removed',
        durationMs: 3000,
      });
      invalidateAll();
    },
    onError: (err) => {
      addToast({
        type: 'error',
        title: 'Could not remove bank account',
        description: getApiErrorMessage(err),
        durationMs: 5000,
      });
    },
  });

  if (financeQuery.isPending || payoutsQuery.isPending) {
    return (
      <p role="status" className="text-rewear-muted text-sm">
        Loading shop funds…
      </p>
    );
  }

  if (financeQuery.isError || payoutsQuery.isError) {
    return (
      <div role="alert" className="border-rewear-border space-y-3 border p-6">
        <p className="text-sm">Could not load your shop funds.</p>
        <button
          type="button"
          className="bg-rewear-text min-h-11 px-4 text-sm font-semibold text-white"
          onClick={() => {
            void financeQuery.refetch();
            void payoutsQuery.refetch();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const finance = financeQuery.data?.data as
    Partial<ShopFinanceSummary> | undefined;
  const accounts = payoutsQuery.data?.data.accounts ?? [];
  const payouts = payoutsQuery.data?.data.payouts ?? [];
  const defaultAccount: ShopBankAccount | undefined =
    accounts.find((a) => a.isDefault) ?? accounts[0];

  const available = Number(finance?.available ?? 0);
  const held = Number(finance?.held ?? 0);
  const payoutLocked = Number(finance?.payoutLocked ?? 0);
  const paidOut = Number(finance?.paidOut ?? 0);

  return (
    <div className="max-w-[960px] space-y-8">
      <div className="space-y-2">
        <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
          Funds
        </h1>
        <p className="text-rewear-muted text-sm">
          Shipping fees are excluded from your balance.
        </p>
      </div>

      {/* Balance and withdrawal block — Figma 53:1502 */}
      <section className="border-rewear-border space-y-6 border bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-rewear-muted text-sm font-medium">
              Available to withdraw
            </p>
            <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums sm:text-[36px]">
              {formatPrice(available)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setWithdrawOpen(true)}
            disabled={available <= 0 || accounts.length === 0}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 min-h-12 w-full px-6 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[240px]"
          >
            Request withdrawal
          </button>
        </div>

        <dl className="border-rewear-border grid gap-4 border-t pt-6 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-rewear-muted">Pending (escrow)</dt>
            <dd className="mt-1 font-mono font-semibold tabular-nums">
              {formatPrice(held)}
            </dd>
          </div>
          <div>
            <dt className="text-rewear-muted">Reserved for payout</dt>
            <dd className="mt-1 font-mono font-semibold tabular-nums">
              {formatPrice(payoutLocked)}
            </dd>
          </div>
          <div>
            <dt className="text-rewear-muted">Total paid out</dt>
            <dd className="mt-1 font-mono font-semibold tabular-nums">
              {formatPrice(paidOut)}
            </dd>
          </div>
        </dl>

        {/* Bank account summary */}
        <div className="bg-rewear-soft flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <Building2
              size={18}
              className="text-rewear-muted shrink-0"
              aria-hidden="true"
            />
            {defaultAccount ? (
              <div className="text-sm">
                <p className="font-semibold">
                  {defaultAccount.bankCode} ·{' '}
                  <span className="font-mono">
                    {maskAccountNumber(defaultAccount.accountNumber)}
                  </span>{' '}
                  · {defaultAccount.accountName}
                </p>
                <p className="text-rewear-muted text-xs">
                  Default receiving bank account
                </p>
              </div>
            ) : (
              <div className="text-sm">
                <p className="font-semibold">No bank account added</p>
                <p className="text-rewear-muted text-xs">
                  Add a verified bank account before requesting a withdrawal.
                </p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setBankOpen(true)}
            className="border-rewear-border bg-rewear-surface hover:bg-rewear-soft inline-flex min-h-11 items-center gap-1.5 border px-4 text-sm font-semibold"
          >
            <Plus size={16} aria-hidden="true" />
            Add bank account
          </button>
        </div>

        {accounts.length > 1 && (
          <div className="space-y-2">
            <p className="text-rewear-muted text-xs font-semibold uppercase">
              Saved bank accounts
            </p>
            <ul className="divide-rewear-border border-rewear-border divide-y border">
              {accounts.map((acc) => (
                <li
                  key={acc.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span>
                    <span className="font-semibold">{acc.bankCode}</span> ·{' '}
                    <span className="font-mono">
                      {maskAccountNumber(acc.accountNumber)}
                    </span>{' '}
                    · {acc.accountName}
                    {acc.isDefault && (
                      <span className="bg-rewear-soft ml-2 px-2 py-0.5 text-xs font-semibold">
                        Default
                      </span>
                    )}
                  </span>
                  {confirmRemoveId === acc.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={deleteBankMutation.isPending}
                        onClick={() => deleteBankMutation.mutate(acc.id)}
                        className="bg-red-700 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Confirm remove
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(null)}
                        className="text-rewear-muted px-2 py-1 text-xs font-semibold underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Remove ${acc.bankCode} ${acc.accountName}`}
                      onClick={() => setConfirmRemoveId(acc.id)}
                      className="text-rewear-muted inline-flex min-h-9 items-center gap-1 text-xs hover:text-red-700"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Payout requests table — Figma 53:1517 */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-[-0.02em]">
          Recent activity
        </h2>

        {payouts.length === 0 ? (
          <p className="border-rewear-border text-rewear-muted border bg-white p-6 text-sm">
            No withdrawal requests yet.
          </p>
        ) : (
          <div className="border-rewear-border overflow-x-auto border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-rewear-soft text-rewear-muted text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Request</th>
                  <th className="px-4 py-3 font-semibold">Receiving account</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Requested</th>
                  <th className="px-4 py-3 text-right font-semibold">Amount</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-rewear-border divide-y">
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-4 py-3.5">
                      <p className="font-mono text-xs font-semibold">
                        {payout.requestId}
                      </p>
                      {payout.bankReference && (
                        <p className="text-rewear-muted mt-0.5 font-mono text-xs">
                          Ref: {payout.bankReference}
                        </p>
                      )}
                      {payout.reason && (
                        <p className="mt-0.5 text-xs text-red-700">
                          {payout.reason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <p className="font-semibold">
                        {payout.recipientSnapshot.bankCode} ·{' '}
                        <span className="font-mono">
                          {maskAccountNumber(
                            payout.recipientSnapshot.accountNumber,
                          )}
                        </span>
                      </p>
                      <p className="text-rewear-muted">
                        {payout.recipientSnapshot.accountName}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE_STYLES[payout.status]}`}
                      >
                        {STATUS_LABELS[payout.status]}
                      </span>
                    </td>
                    <td className="text-rewear-muted px-4 py-3.5 text-xs">
                      {formatDate(payout.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold tabular-nums">
                      {formatPrice(payout.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {payout.status === 'PENDING' ? (
                        <button
                          type="button"
                          disabled={cancelPayoutMutation.isPending}
                          onClick={() => cancelPayoutMutation.mutate(payout.id)}
                          className="text-xs font-semibold text-red-700 underline underline-offset-4 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-rewear-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div>
        <button
          type="button"
          onClick={() => setSettlementOpen(true)}
          className="text-rewear-text inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          <HelpCircle size={16} aria-hidden="true" />
          How settlement works
        </button>
      </div>

      {withdrawOpen && (
        <RequestWithdrawalModal
          shopId={shopId}
          available={available}
          accounts={accounts}
          defaultBankId={defaultAccount?.id ?? ''}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={() => {
            setWithdrawOpen(false);
            addToast({
              type: 'success',
              title: 'Withdrawal requested',
              description:
                'The requested amount is reserved until transfer completes.',
              durationMs: 4000,
            });
            invalidateAll();
          }}
        />
      )}

      {bankOpen && (
        <AddBankAccountModal
          shopId={shopId}
          onClose={() => setBankOpen(false)}
          onSuccess={() => {
            setBankOpen(false);
            addToast({
              type: 'success',
              title: 'Bank account saved',
              durationMs: 3500,
            });
            invalidateAll();
          }}
        />
      )}

      {settlementOpen && (
        <SettlementInfoModal onClose={() => setSettlementOpen(false)} />
      )}
    </div>
  );
}
