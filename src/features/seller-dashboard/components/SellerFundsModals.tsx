'use client';

import { useState } from 'react';

import {
  type ShopBankAccount,
  shopFinanceApi,
} from '@/modules/shop-finance/shop-finance-api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { formatPrice } from '@/shared/utils/product';
import { useMutation } from '@tanstack/react-query';

export function maskAccountNumber(accountNumber: string) {
  return `•••• ${accountNumber.slice(-4)}`;
}

export function RequestWithdrawalModal({
  shopId,
  available,
  accounts,
  defaultBankId,
  onClose,
  onSuccess,
}: {
  shopId: string;
  available: number;
  accounts: ShopBankAccount[];
  defaultBankId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amountText, setAmountText] = useState(
    available > 0 ? String(available) : '',
  );
  const [bankAccountId, setBankAccountId] = useState(defaultBankId);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (amount: number) =>
      shopFinanceApi.requestPayout(shopId, {
        requestId: `WD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        amount,
        bankAccountId,
      }),
    onSuccess: () => onSuccess(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const amount = Number(amountText);
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Enter a valid withdrawal amount in VND.');
      return;
    }
    if (amount > available) {
      setError('Amount exceeds your available balance.');
      return;
    }
    if (!bankAccountId) {
      setError('Select a receiving bank account first.');
      return;
    }
    mutation.mutate(amount);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[520px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>

          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Request withdrawal
          </h2>

          <div className="space-y-4">
            <div className="bg-rewear-soft space-y-1 p-4">
              <label
                htmlFor="withdraw-amount"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Amount (VND) · Max {formatPrice(available)}
              </label>
              <input
                id="withdraw-amount"
                type="number"
                min={1}
                max={available}
                step={1}
                required
                value={amountText}
                onChange={(e) => setAmountText(e.target.value)}
                className="text-rewear-text w-full bg-transparent font-mono text-base font-semibold outline-none"
              />
            </div>

            <div className="bg-rewear-soft space-y-1 p-4">
              <label
                htmlFor="withdraw-bank"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Receiving account
              </label>
              <select
                id="withdraw-bank"
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                className="text-rewear-text w-full bg-transparent text-sm font-semibold outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankCode} · {maskAccountNumber(acc.accountNumber)} ·{' '}
                    {acc.accountName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-rewear-muted text-sm">
            The amount is reserved until processing finishes.
          </p>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-12 w-full text-sm font-semibold transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting…' : 'Request withdrawal'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBankAccountModal({
  shopId,
  onClose,
  onSuccess,
}: {
  shopId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      shopFinanceApi.addBankAccount(shopId, {
        bankCode: bankCode.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        ownerConfirmed: true,
        isDefault: true,
      }),
    onSuccess: () => onSuccess(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!/^[A-Z0-9_-]{2,40}$/.test(bankCode.trim().toUpperCase())) {
      setError('Enter a valid bank code (e.g. VCB, TCB, MB, ACB).');
      return;
    }
    if (!/^[0-9]{4,40}$/.test(accountNumber.trim())) {
      setError('Account number must contain 4 to 40 digits.');
      return;
    }
    if (accountName.trim().length < 2) {
      setError('Enter the account holder full name.');
      return;
    }
    if (!ownerConfirmed) {
      setError('Confirm that this bank account belongs to the shop owner.');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[520px] rounded-none border p-8 shadow-xl outline-none"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>

          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Add bank account
          </h2>

          <div className="space-y-3">
            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="bank-code"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Bank code (e.g. VCB, TCB, MB, ACB)
              </label>
              <input
                id="bank-code"
                type="text"
                required
                placeholder="VCB"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold uppercase outline-none"
              />
            </div>

            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="bank-number"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Account number
              </label>
              <input
                id="bank-number"
                type="text"
                inputMode="numeric"
                required
                placeholder="0123456789"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-transparent font-mono text-sm font-semibold outline-none"
              />
            </div>

            <div className="bg-rewear-soft space-y-1 p-3.5">
              <label
                htmlFor="bank-holder"
                className="text-rewear-muted block text-xs font-semibold"
              >
                Account holder name
              </label>
              <input
                id="bank-holder"
                type="text"
                required
                placeholder="NGUYEN VAN A"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </div>

            <label className="flex items-start gap-3 pt-1 text-sm">
              <input
                type="checkbox"
                checked={ownerConfirmed}
                onChange={(e) => setOwnerConfirmed(e.target.checked)}
                className="mt-1 size-4"
              />
              <span>
                I confirm this bank account belongs to the shop owner.
              </span>
            </label>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 h-12 w-full text-sm font-semibold transition disabled:opacity-50"
          >
            {mutation.isPending ? 'Saving…' : 'Save bank account'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SettlementInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="bg-rewear-surface text-rewear-text border-rewear-border max-w-[560px] rounded-none border p-8 shadow-xl outline-none"
      >
        <div className="space-y-6">
          <button
            type="button"
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted text-sm font-semibold"
          >
            Close ×
          </button>
          <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Settlement
          </h2>
          <div className="space-y-5 text-sm leading-6">
            <div>
              <h3 className="font-semibold">Pending → Available</h3>
              <p className="text-rewear-muted mt-1">
                Funds stay pending for 72 hours after delivery while the buyer
                inspection window is open.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Claims</h3>
              <p className="text-rewear-muted mt-1">
                An open dispute or return claim pauses settlement for the
                affected amount until resolved.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Withdrawals</h3>
              <p className="text-rewear-muted mt-1">
                Platform commission is deducted before funds become available to
                withdraw.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
