import { axiosClient } from '@/shared/api/axios-client';

type Envelope<T> = { data: T };

export type WalletCredit = {
  id: string;
  orderId: string | null;
  paymentRefundId?: string | null;
  amount: number;
  reason: 'ORDER_CANCELLED' | 'LATE_PAYMENT_REFUND' | string;
  mode: 'EVIDENCE' | 'SIMULATION' | null;
  createdAt: string;
};

export type WalletDisputeRefund = {
  id: string;
  orderId: string;
  amount: number;
  status?: string;
  createdAt: string;
};

export type WalletSummary = {
  balance: number;
  simulationBalance: number;
  heldBalance: number;
  simulationHeldBalance: number;
  currency: 'VND';
  credits: WalletCredit[];
  disputeRefunds: WalletDisputeRefund[];
};

export type CoinBalance = {
  balance: number;
  heldBalance: number;
  simulationBalance: number;
  simulationHeldBalance: number;
};

export type CoinRewardEntry = {
  id: string;
  orderId: string;
  mode: 'EVIDENCE' | 'SIMULATION';
  grantedAmount: number;
  entitlement: number;
  recoveredAmount: number;
  evaluatedAt: string;
  createdAt: string;
};

export type CoinDebitEntry = {
  id: string;
  orderId: string;
  mode: 'EVIDENCE' | 'SIMULATION';
  amount: number;
  createdAt: string;
};

export type CoinHistory = {
  rewards: CoinRewardEntry[];
  debits: CoinDebitEntry[];
};

export const walletApi = {
  getWallet: (params?: { limit?: number; offset?: number }) =>
    axiosClient.get<never, Envelope<WalletSummary>>('/wallet/mine', { params }),
  getCoinBalance: () =>
    axiosClient.get<never, Envelope<CoinBalance>>('/coins/balance'),
  getCoinHistory: (params?: { limit?: number; offset?: number }) =>
    axiosClient.get<never, Envelope<CoinHistory>>('/coins/history', { params }),
};
