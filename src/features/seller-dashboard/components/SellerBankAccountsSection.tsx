'use client';

import { type FormEvent, useState } from 'react';

import {
  type BankAccountValidationErrors,
  COMMON_VN_BANKS,
  createShopBankAccount,
  deleteShopBankAccount,
  fetchShopPayoutOverview,
  type ShopBankAccount,
  shopBankAccountsQueryKey,
  updateShopBankAccount,
  validateBankAccountFields,
} from '@/modules/shop/api/shop-bank-accounts';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useToastStore } from '@/shared/stores/toast.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark, Plus, Trash2 } from 'lucide-react';

export function SellerBankAccountsSection({
  shopId,
  isOwner,
}: {
  shopId: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShopBankAccount | null>(null);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [errors, setErrors] = useState<BankAccountValidationErrors>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const payoutsQuery = useQuery({
    queryKey: shopBankAccountsQueryKey(shopId),
    queryFn: ({ signal }) => fetchShopPayoutOverview(shopId, signal),
    enabled: Boolean(shopId && isOwner),
    meta: { skipErrorToast: true },
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        bankCode: bankCode.trim().toUpperCase(),
        accountNumber: accountNumber.replace(/\s+/g, ''),
        accountName: accountName.trim(),
        ownerConfirmed: true as const,
        isDefault,
      };
      return editing
        ? updateShopBankAccount(shopId, editing.id, payload)
        : createShopBankAccount(shopId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: shopBankAccountsQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: editing ? 'Bank account updated' : 'Bank account added',
        durationMs: 3000,
      });
      setModalOpen(false);
    },
    meta: { skipSuccessToast: true, skipErrorToast: true },
  });

  const deleteMutation = useMutation({
    mutationFn: (accountId: string) => deleteShopBankAccount(shopId, accountId),
    onSuccess: async () => {
      setConfirmDeleteId(null);
      await queryClient.invalidateQueries({
        queryKey: shopBankAccountsQueryKey(shopId),
      });
      addToast({
        type: 'success',
        title: 'Bank account removed',
        durationMs: 3000,
      });
    },
    onError: (err) => setActionError(getApiErrorMessage(err)),
    meta: { skipSuccessToast: true, skipErrorToast: true },
  });

  const openAdd = () => {
    setEditing(null);
    setBankCode('');
    setAccountNumber('');
    setAccountName('');
    setIsDefault((payoutsQuery.data?.data.accounts.length ?? 0) === 0);
    setOwnerConfirmed(false);
    setErrors({});
    saveMutation.reset();
    setModalOpen(true);
  };

  const openEdit = (account: ShopBankAccount) => {
    setEditing(account);
    setBankCode(account.bankCode);
    setAccountNumber(account.accountNumber);
    setAccountName(account.accountName);
    setIsDefault(account.isDefault);
    setOwnerConfirmed(true);
    setErrors({});
    saveMutation.reset();
    setModalOpen(true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validateBankAccountFields({
      bankCode,
      accountNumber,
      accountName,
      ownerConfirmed,
    });
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    saveMutation.mutate();
  };

  const accounts = payoutsQuery.data?.data.accounts ?? [];

  if (!isOwner) {
    return (
      <section className="border-rewear-border space-y-2 border bg-white p-6">
        <h3 className="text-lg font-semibold">Payout bank accounts</h3>
        <p className="text-rewear-muted text-sm">
          Only the shop owner can view or manage payout bank accounts.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="shop-bank-heading"
      className="border-rewear-border space-y-5 border bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 id="shop-bank-heading" className="text-lg font-semibold">
            Payout bank accounts
          </h3>
          <p className="text-rewear-muted mt-1 text-sm">
            Bank accounts where completed seller payouts are transferred.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex min-h-11 cursor-pointer items-center gap-2 px-4 text-sm font-semibold transition"
        >
          <Plus size={16} aria-hidden="true" />
          Add bank account
        </button>
      </div>

      {actionError && (
        <p role="alert" className="text-destructive text-sm">
          {actionError}
        </p>
      )}

      {payoutsQuery.isPending ? (
        <p role="status" className="text-rewear-muted text-sm">
          Loading bank accounts…
        </p>
      ) : payoutsQuery.isError ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>Could not load payout bank accounts.</p>
          <button
            type="button"
            onClick={() => void payoutsQuery.refetch()}
            className="min-h-11 cursor-pointer font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-rewear-soft space-y-2 p-5 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Landmark size={16} aria-hidden="true" />
            <span>No bank account added yet</span>
          </div>
          <p className="text-rewear-muted">
            Add a payout bank account before requesting withdrawals.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border-rewear-border flex flex-wrap items-center justify-between gap-4 border p-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold">
                    {account.bankCode}
                  </span>
                  <span className="font-mono text-sm">
                    {account.accountNumber}
                  </span>
                  {account.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                <p className="text-rewear-muted text-sm">
                  {account.accountName}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => openEdit(account)}
                  className="min-h-11 cursor-pointer underline underline-offset-4"
                >
                  Edit
                </button>
                {confirmDeleteId === account.id ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        setActionError('');
                        deleteMutation.mutate(account.id);
                      }}
                      className="text-destructive min-h-11 cursor-pointer underline underline-offset-4 disabled:opacity-50"
                    >
                      Confirm remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-rewear-muted min-h-11 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => setConfirmDeleteId(account.id)}
                    className="text-rewear-muted hover:text-destructive inline-flex min-h-11 cursor-pointer items-center gap-1 disabled:opacity-50"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 sm:max-w-[520px] sm:p-8"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-rewear-muted hover:text-rewear-text min-h-11 cursor-pointer text-sm font-semibold"
            >
              Close ×
            </button>
          </div>
          <DialogHeader className="gap-2">
            <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              {editing ? 'Edit bank account' : 'Add bank account'}
            </DialogTitle>
            <DialogDescription className="text-rewear-muted text-sm">
              Enter the shop owner&apos;s bank details for seller payouts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} noValidate className="mt-2 space-y-4">
            <div className="space-y-1">
              <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
                <label
                  htmlFor="settings-bank-code"
                  className="block text-sm font-semibold"
                >
                  Bank code
                </label>
                <input
                  id="settings-bank-code"
                  type="text"
                  list="settings-vn-banks"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                  placeholder="e.g. VCB, TCB, MB"
                  className="h-6 w-full bg-transparent font-mono text-sm uppercase focus:outline-none"
                />
                <datalist id="settings-vn-banks">
                  {COMMON_VN_BANKS.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </datalist>
              </div>
              {errors.bankCode && (
                <p role="alert" className="text-destructive text-xs">
                  {errors.bankCode}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
                <label
                  htmlFor="settings-account-number"
                  className="block text-sm font-semibold"
                >
                  Account number
                </label>
                <input
                  id="settings-account-number"
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) =>
                    setAccountNumber(e.target.value.replace(/[^0-9\s]/g, ''))
                  }
                  placeholder="e.g. 0123456789"
                  className="h-6 w-full bg-transparent font-mono text-sm focus:outline-none"
                />
              </div>
              {errors.accountNumber && (
                <p role="alert" className="text-destructive text-xs">
                  {errors.accountNumber}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="bg-rewear-soft space-y-1.5 rounded-lg px-4 py-3">
                <label
                  htmlFor="settings-account-name"
                  className="block text-sm font-semibold"
                >
                  Account holder name
                </label>
                <input
                  id="settings-account-name"
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. NGUYEN MINH ANH"
                  className="h-6 w-full bg-transparent text-base focus:outline-none"
                />
              </div>
              {errors.accountName && (
                <p role="alert" className="text-destructive text-xs">
                  {errors.accountName}
                </p>
              )}
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="border-rewear-border size-4"
              />
              <span>Set as default payout account</span>
            </label>

            <div className="space-y-1">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={ownerConfirmed}
                  onChange={(e) => setOwnerConfirmed(e.target.checked)}
                  className="border-rewear-border size-4"
                />
                <span>I confirm this account belongs to the shop owner.</span>
              </label>
              {errors.ownerConfirmed && (
                <p role="alert" className="text-destructive text-xs">
                  {errors.ownerConfirmed}
                </p>
              )}
            </div>

            {!!saveMutation.error && (
              <p role="alert" className="text-destructive text-sm">
                {getApiErrorMessage(saveMutation.error)}
              </p>
            )}

            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex min-h-12 w-full cursor-pointer items-center justify-center text-sm font-semibold transition disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save bank account'}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
