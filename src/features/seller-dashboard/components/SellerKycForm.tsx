'use client';

import { useState } from 'react';

import {
  addShopBankAccount,
  attachApplicationDocument,
  type BankAccountView,
  type IdentityDocumentSlot,
  type IdentityDocumentType,
  openApplicationDocumentDownload,
  type ShopApplicationDetail,
  submitIdentityRenewal,
  submitShopApplication,
} from '@/modules/kyc/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import { useMutation } from '@tanstack/react-query';
import { FileUp } from 'lucide-react';

interface SellerKycFormProps {
  shopId: string;
  detail: ShopApplicationDetail;
  accounts: BankAccountView[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: 'success' | 'error', message: string) => void;
}

export function SellerKycForm({
  shopId,
  detail,
  accounts,
  onRefresh,
  onFeedback,
}: SellerKycFormProps) {
  const [documentType, setDocumentType] = useState<IdentityDocumentType>(
    detail.identity?.documentType ?? 'NATIONAL_ID',
  );
  const [documentNumber, setDocumentNumber] = useState(
    detail.identity?.documentNumber ?? '',
  );
  const [issuingCountry, setIssuingCountry] = useState(
    detail.identity?.issuingCountry ?? 'VN',
  );
  const [fullName, setFullName] = useState(detail.identity?.fullName ?? '');
  const [birthDate, setBirthDate] = useState(detail.identity?.birthDate ?? '');
  const [expiresOn, setExpiresOn] = useState(detail.identity?.expiresOn ?? '');
  const [selectedBankId, setSelectedBankId] = useState(
    detail.bank?.id ?? accounts[0]?.id ?? '',
  );
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankCode, setBankCode] = useState('VCB');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const effectiveBankId = selectedBankId || accounts[0]?.id || '';

  const uploadDocMutation = useMutation({
    mutationFn: (input: { slot: IdentityDocumentSlot; file: File }) =>
      attachApplicationDocument(detail.id, input.slot, input.file),
    onSuccess: async () => {
      onFeedback('success', 'Document uploaded securely.');
      await onRefresh();
    },
    onError: (err) => onFeedback('error', getApiErrorMessage(err)),
  });

  const addBankMutation = useMutation({
    mutationFn: () =>
      addShopBankAccount(shopId, {
        bankCode: bankCode.trim().toUpperCase(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        ownerConfirmed: true,
        isDefault: accounts.length === 0,
      }),
    onSuccess: async (res) => {
      setSelectedBankId(res.data.id);
      setShowAddBank(false);
      setAccountNumber('');
      setAccountName('');
      onFeedback('success', 'Payout bank account confirmed.');
      await onRefresh();
    },
    onError: (err) => onFeedback('error', getApiErrorMessage(err)),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const documentIds = detail.documents.map((d) => d.id);
      if (documentIds.length === 0) {
        throw new Error('Upload at least one identity document image.');
      }
      const identity = {
        documentType,
        documentNumber: documentNumber.trim().toUpperCase(),
        issuingCountry: issuingCountry.trim().toUpperCase(),
        fullName: fullName.trim(),
        birthDate,
        expiresOn,
      };
      if (detail.kind === 'RENEWAL') {
        return submitIdentityRenewal(detail.id, { identity, documentIds });
      }
      if (!effectiveBankId) {
        throw new Error('Select or add a confirmed shop payout bank account.');
      }
      return submitShopApplication(detail.id, {
        identity,
        bankAccountId: effectiveBankId,
        documentIds,
      });
    },
    onSuccess: async () => {
      onFeedback(
        'success',
        'KYC verification submitted for administrator review.',
      );
      await onRefresh();
    },
    onError: (err) => onFeedback('error', getApiErrorMessage(err)),
  });

  const uploadSlots: readonly IdentityDocumentSlot[] =
    documentType === 'NATIONAL_ID' ? ['FRONT', 'BACK'] : ['PASSPORT'];

  return (
    <div className="space-y-5">
      {/* Document Upload & List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">
          Identity document photos ({detail.documents.length})
        </h3>

        {detail.documents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {detail.documents.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() =>
                  void openApplicationDocumentDownload(doc.id).catch((err) =>
                    onFeedback('error', getApiErrorMessage(err)),
                  )
                }
                className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
              >
                <FileUp size={14} />
                {doc.slot} ({Math.round(doc.sizeBytes / 1024)} KB)
              </button>
            ))}
          </div>
        )}

        <div className="bg-rewear-soft grid gap-3 rounded-lg p-4 sm:grid-cols-3">
          {uploadSlots.map((slot) => (
            <label
              key={slot}
              className="border-rewear-border grid cursor-pointer gap-1 rounded-lg border bg-white p-3 text-xs font-semibold"
            >
              <span>
                Upload{' '}
                {slot === 'FRONT'
                  ? 'CCCD Front'
                  : slot === 'BACK'
                    ? 'CCCD Back'
                    : 'Passport Photo Page'}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadDocMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    uploadDocMutation.mutate({ slot, file });
                  }
                }}
                className="text-rewear-muted font-normal"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Identity & Payout Bank Form */}
      <form
        className="border-rewear-border space-y-5 border-t pt-5"
        onSubmit={(e) => {
          e.preventDefault();
          submitMutation.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-semibold">
            Document type
            <select
              value={documentType}
              onChange={(e) =>
                setDocumentType(e.target.value as IdentityDocumentType)
              }
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="NATIONAL_ID">
                Vietnam National ID (CCCD - 12 digits)
              </option>
              <option value="PASSPORT">Passport</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Document number
            <input
              type="text"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              placeholder={
                documentType === 'NATIONAL_ID' ? '079199001234' : 'P12345678'
              }
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Full legal name
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="NGUYEN VAN A"
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Issuing country (ISO-2)
            <input
              type="text"
              required
              maxLength={2}
              value={issuingCountry}
              onChange={(e) => setIssuingCountry(e.target.value.toUpperCase())}
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Date of birth
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Document expiry date
            <input
              type="date"
              required
              value={expiresOn}
              onChange={(e) => setExpiresOn(e.target.value)}
              className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
            />
          </label>
        </div>

        {detail.kind === 'INITIAL' && (
          <div className="bg-rewear-soft space-y-3 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold">
                Confirmed payout bank account
              </span>
              <button
                type="button"
                onClick={() => setShowAddBank((v) => !v)}
                className="text-xs font-semibold underline"
              >
                {showAddBank ? 'Hide form' : '+ Add bank account'}
              </button>
            </div>

            {accounts.length > 0 && (
              <select
                aria-label="Payout bank account"
                value={effectiveBankId}
                onChange={(e) => setSelectedBankId(e.target.value)}
                className="border-rewear-border min-h-11 w-full rounded-lg border bg-white px-3 text-sm"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bankCode} · {acc.accountNumber} · {acc.accountName}
                  </option>
                ))}
              </select>
            )}

            {(showAddBank || accounts.length === 0) && (
              <div className="grid gap-3 rounded-lg bg-white p-4 sm:grid-cols-3">
                <input
                  type="text"
                  placeholder="Bank code (e.g. VCB)"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="border-rewear-border min-h-11 rounded-lg border px-3 text-sm"
                />
                <input
                  type="text"
                  placeholder="Account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="border-rewear-border min-h-11 rounded-lg border px-3 font-mono text-sm"
                />
                <input
                  type="text"
                  placeholder="Account holder name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="border-rewear-border min-h-11 rounded-lg border px-3 text-sm"
                />
                <button
                  type="button"
                  disabled={
                    addBankMutation.isPending ||
                    !bankCode.trim() ||
                    !accountNumber.trim() ||
                    !accountName.trim()
                  }
                  onClick={() => addBankMutation.mutate()}
                  className="bg-rewear-text min-h-11 rounded-lg px-4 text-xs font-semibold text-white disabled:opacity-50 sm:col-span-3 sm:w-fit"
                >
                  {addBankMutation.isPending
                    ? 'Saving…'
                    : 'Save & confirm bank account'}
                </button>
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={submitMutation.isPending}
          className="bg-rewear-accent text-rewear-text min-h-12 w-full rounded-lg px-6 text-sm font-semibold disabled:opacity-50 sm:w-auto"
        >
          {submitMutation.isPending
            ? 'Submitting verification…'
            : detail.kind === 'RENEWAL'
              ? 'Submit identity renewal'
              : 'Submit KYC verification'}
        </button>
      </form>
    </div>
  );
}
