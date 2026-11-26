'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { CartLink } from '@/modules/cart/components/CartLink';
import { walletApi } from '@/modules/wallet/wallet-api';
import { MarketplaceFooter } from '@/shared/components/marketplace/MarketplaceFooter';
import { MarketplaceHeader } from '@/shared/components/marketplace/MarketplaceHeader';
import { MobileNavigation } from '@/shared/components/marketplace/MobileNavigation';
import { formatPrice } from '@/shared/utils/product';
import { useQuery } from '@tanstack/react-query';
import { Coins, Info, Wallet } from 'lucide-react';
import { useSession } from 'next-auth/react';

type ActiveLedgerTab = 'wallet' | 'coins';

type CoinLedgerRow = {
  id: string;
  orderId: string;
  kind: 'EARN' | 'SPEND' | 'CLAWBACK';
  amount: number;
  detail: string;
  createdAt: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

function formatCoins(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} coins`;
}

export function WalletPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const enabled = status === 'authenticated' && !session?.error;
  const [activeTab, setActiveTab] = useState<ActiveLedgerTab>('wallet');

  const walletQuery = useQuery({
    queryKey: ['wallet', 'mine', session?.user.id],
    queryFn: () => walletApi.getWallet({ limit: 50, offset: 0 }),
    enabled,
  });

  const coinBalanceQuery = useQuery({
    queryKey: ['coins', 'balance', session?.user.id],
    queryFn: () => walletApi.getCoinBalance(),
    enabled,
  });

  const coinHistoryQuery = useQuery({
    queryKey: ['coins', 'history', session?.user.id],
    queryFn: () => walletApi.getCoinHistory({ limit: 50, offset: 0 }),
    enabled,
  });

  const wallet = walletQuery.data?.data;
  const coinBalance = coinBalanceQuery.data?.data;
  const coinHistory = coinHistoryQuery.data?.data;

  const walletRows = useMemo(() => {
    if (!wallet) return [];
    const credits = wallet.credits.map((entry) => ({
      id: `credit-${entry.id}`,
      orderId: entry.orderId,
      label:
        entry.reason === 'ORDER_CANCELLED'
          ? 'Cancelled order refund'
          : entry.reason === 'LATE_PAYMENT_REFUND'
            ? 'Late payment refund credit'
            : entry.reason.replaceAll('_', ' ').toLowerCase(),
      amount: entry.amount,
      createdAt: entry.createdAt,
    }));
    const refunds = wallet.disputeRefunds.map((entry) => ({
      id: `dispute-${entry.id}`,
      orderId: entry.orderId,
      label: 'Dispute refund credit',
      amount: entry.amount,
      createdAt: entry.createdAt,
    }));
    return [...credits, ...refunds].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [wallet]);

  const coinRows = useMemo<CoinLedgerRow[]>(() => {
    if (!coinHistory) return [];
    const rows: CoinLedgerRow[] = [];

    for (const reward of coinHistory.rewards) {
      if (reward.grantedAmount > 0) {
        rows.push({
          id: `reward-${reward.id}`,
          orderId: reward.orderId,
          kind: 'EARN',
          amount: reward.grantedAmount,
          detail: '0.5% completed order reward',
          createdAt: reward.evaluatedAt || reward.createdAt,
        });
      }
      if (reward.recoveredAmount > 0) {
        rows.push({
          id: `clawback-${reward.id}`,
          orderId: reward.orderId,
          kind: 'CLAWBACK',
          amount: -reward.recoveredAmount,
          detail: 'Reward clawback after order refund',
          createdAt: reward.evaluatedAt || reward.createdAt,
        });
      }
    }

    for (const debit of coinHistory.debits) {
      rows.push({
        id: `debit-${debit.id}`,
        orderId: debit.orderId,
        kind: 'SPEND',
        amount: -debit.amount,
        detail: 'Applied at checkout',
        createdAt: debit.createdAt,
      });
    }

    return rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [coinHistory]);

  const isLoading =
    status === 'loading' ||
    (enabled && (walletQuery.isPending || coinBalanceQuery.isPending));
  const hasError = walletQuery.isError || coinBalanceQuery.isError;

  return (
    <div className="bg-rewear-surface text-rewear-text flex min-h-dvh flex-col">
      <MarketplaceHeader
        cartAction={<CartLink />}
        search=""
        onSearch={(value) =>
          router.push(`/products?search=${encodeURIComponent(value)}`)
        }
      />

      <main
        id="main-content"
        className="mx-auto w-full max-w-[1280px] flex-1 space-y-8 px-4 py-8 md:px-12 md:py-12"
      >
        <div className="space-y-2">
          <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.02em] md:text-[40px] md:leading-[46px]">
            Wallet &amp; Coins
          </h1>
          <p className="text-rewear-muted max-w-2xl text-sm leading-6">
            Track refund credits and reward coins earned from completed orders.
          </p>
        </div>

        {isLoading ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading wallet and coins…
          </p>
        ) : !enabled ? (
          <div className="border-rewear-border border p-6">
            <p className="text-sm">
              Please{' '}
              <Link href="/login?callbackUrl=%2Fwallet" className="underline">
                sign in
              </Link>{' '}
              to view your wallet and coins.
            </p>
          </div>
        ) : hasError ? (
          <div
            role="alert"
            className="border-rewear-border space-y-3 border p-6"
          >
            <p className="text-sm">
              Could not load your wallet or coin balance right now.
            </p>
            <button
              type="button"
              onClick={() => {
                void walletQuery.refetch();
                void coinBalanceQuery.refetch();
                void coinHistoryQuery.refetch();
              }}
              className="bg-rewear-text min-h-11 px-4 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Balance summary */}
            <section
              aria-label="Balances"
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="border-rewear-border flex flex-col justify-between gap-6 border bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold">
                      Refund-only wallet
                    </h2>
                    <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                      {formatPrice(wallet?.balance ?? 0)}
                    </p>
                    <p className="text-rewear-muted text-xs">
                      Held for checkout:{' '}
                      <span className="font-mono tabular-nums">
                        {formatPrice(wallet?.heldBalance ?? 0)}
                      </span>
                    </p>
                  </div>
                  <div className="bg-rewear-soft flex size-11 shrink-0 items-center justify-center">
                    <Wallet size={20} aria-hidden="true" />
                  </div>
                </div>
                <p className="border-rewear-border text-rewear-muted border-t pt-4 text-xs leading-5">
                  Credited automatically from cancelled orders and approved
                  disputes. Covers up to 100% of checkout total.
                  Non-withdrawable and cannot be topped up manually.
                </p>
              </div>

              <div className="border-rewear-border flex flex-col justify-between gap-6 border bg-white p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-base font-semibold">Reward coins</h2>
                    <p className="font-mono text-3xl font-semibold tracking-tight tabular-nums">
                      {formatCoins(coinBalance?.balance ?? 0)}
                    </p>
                    <p className="text-rewear-muted text-xs">
                      Reserved at checkout:{' '}
                      <span className="font-mono tabular-nums">
                        {formatCoins(coinBalance?.heldBalance ?? 0)}
                      </span>
                    </p>
                  </div>
                  <div className="bg-rewear-accent flex size-11 shrink-0 items-center justify-center">
                    <Coins size={20} aria-hidden="true" />
                  </div>
                </div>
                <p className="border-rewear-border text-rewear-muted border-t pt-4 text-xs leading-5">
                  Earn 0.5% of net order value on completed orders (1 coin =
                  1₫). Apply up to 10% of item subtotal at checkout; refunded
                  orders reverse granted coins automatically.
                </p>
              </div>
            </section>

            {/* Policy note */}
            <section className="bg-rewear-soft flex items-start gap-3 p-4 text-sm">
              <Info
                size={18}
                className="text-rewear-muted mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="text-rewear-text leading-6">
                At checkout, you can pay 100% of an order with your Refund-only
                Wallet when your balance covers the total, and combine Reward
                Coins up to 10% of the item subtotal.
              </p>
            </section>

            {/* Ledger tabs */}
            <section className="space-y-4">
              <div
                role="tablist"
                aria-label="Ledger history"
                className="border-rewear-border flex gap-2 border-b"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'wallet'}
                  onClick={() => setActiveTab('wallet')}
                  className={`min-h-11 px-4 text-sm font-semibold transition ${
                    activeTab === 'wallet'
                      ? 'border-rewear-text text-rewear-text border-b-2'
                      : 'text-rewear-muted hover:text-rewear-text'
                  }`}
                >
                  Wallet history ({walletRows.length})
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'coins'}
                  onClick={() => setActiveTab('coins')}
                  className={`min-h-11 px-4 text-sm font-semibold transition ${
                    activeTab === 'coins'
                      ? 'border-rewear-text text-rewear-text border-b-2'
                      : 'text-rewear-muted hover:text-rewear-text'
                  }`}
                >
                  Coins history ({coinRows.length})
                </button>
              </div>

              {activeTab === 'wallet' ? (
                walletRows.length === 0 ? (
                  <p className="text-rewear-muted py-8 text-sm">
                    No refund credits yet. Cancelled orders and approved dispute
                    refunds will appear here.
                  </p>
                ) : (
                  <div className="border-rewear-border overflow-x-auto border">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-rewear-soft text-rewear-muted text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Activity</th>
                          <th className="px-4 py-3 font-semibold">Order</th>
                          <th className="px-4 py-3 font-semibold">Date</th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-rewear-border divide-y">
                        {walletRows.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3.5 font-medium capitalize">
                              {row.label}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs">
                              {row.orderId ? (
                                <Link
                                  href={`/orders/${row.orderId}`}
                                  className="underline underline-offset-4"
                                >
                                  {row.orderId.slice(0, 8)}
                                </Link>
                              ) : (
                                <span className="bg-rewear-soft text-rewear-muted inline-block px-2 py-0.5 font-sans text-xs font-medium">
                                  Late payment refund
                                </span>
                              )}
                            </td>
                            <td className="text-rewear-muted px-4 py-3.5 text-xs">
                              {formatDateTime(row.createdAt)}
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                              +{formatPrice(row.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : coinHistoryQuery.isPending ? (
                <p role="status" className="text-rewear-muted py-6 text-sm">
                  Loading coin history…
                </p>
              ) : coinHistoryQuery.isError ? (
                <div role="alert" className="py-6 text-sm">
                  Could not load coin history.{' '}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => void coinHistoryQuery.refetch()}
                  >
                    Retry
                  </button>
                </div>
              ) : coinRows.length === 0 ? (
                <p className="text-rewear-muted py-8 text-sm">
                  No coin activity yet. Complete an order to earn 0.5% back in
                  reward coins.
                </p>
              ) : (
                <div className="border-rewear-border overflow-x-auto border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-rewear-soft text-rewear-muted text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Activity</th>
                        <th className="px-4 py-3 font-semibold">Type</th>
                        <th className="px-4 py-3 font-semibold">Order</th>
                        <th className="px-4 py-3 font-semibold">Date</th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Coins
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-rewear-border divide-y">
                      {coinRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3.5 font-medium">
                            {row.detail}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-semibold ${
                                row.kind === 'EARN'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : row.kind === 'CLAWBACK'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-rewear-soft text-rewear-text'
                              }`}
                            >
                              {row.kind === 'EARN'
                                ? 'Earned'
                                : row.kind === 'CLAWBACK'
                                  ? 'Clawback'
                                  : 'Spent'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xs">
                            <Link
                              href={`/orders/${row.orderId}`}
                              className="underline underline-offset-4"
                            >
                              {row.orderId.slice(0, 8)}
                            </Link>
                          </td>
                          <td className="text-rewear-muted px-4 py-3.5 text-xs">
                            {formatDateTime(row.createdAt)}
                          </td>
                          <td
                            className={`px-4 py-3.5 text-right font-mono font-semibold tabular-nums ${
                              row.amount > 0
                                ? 'text-emerald-700'
                                : 'text-red-700'
                            }`}
                          >
                            {row.amount > 0 ? '+' : ''}
                            {formatCoins(row.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <MobileNavigation cartAction={<CartLink />} />
      <MarketplaceFooter />
    </div>
  );
}
