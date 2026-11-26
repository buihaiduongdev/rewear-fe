'use client';

import { useState } from 'react';

import {
  decideAdminApplication,
  getAdminApplicationDetail,
  KYC_STATE_LABELS,
  openApplicationDocumentDownload,
} from '@/modules/kyc/api';
import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  UserControllerFindAll200DataDataItem,
  UserControllerUpdateBodyRole,
  UserControllerUpdateBodyStatus,
} from '@/shared/api/models';
import { useUserControllerUpdate } from '@/shared/api/query-generated/users/users';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';

export function UserAccountModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserControllerFindAll200DataDataItem;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [role, setRole] = useState<UserControllerUpdateBodyRole>(user.role);
  const [status, setStatus] = useState<UserControllerUpdateBodyStatus>(
    user.status,
  );
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const updateMutation = useUserControllerUpdate({
    mutation: {
      meta: { skipSuccessToast: true, skipErrorToast: true },
      onSuccess: () => void onSaved(),
      onError: (err) => setError(getApiErrorMessage(err)),
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-w-[480px] rounded-lg border p-8">
        <DialogTitle>Account details</DialogTitle>
        <DialogDescription>
          {user.fullName} ({user.email})
        </DialogDescription>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError('');
            updateMutation.mutate({
              id: user.id,
              data: { role, status },
            });
          }}
        >
          <label className="grid gap-1.5 text-sm font-semibold">
            Account status
            <select
              value={status ?? 'ACTIVE'}
              onChange={(e) =>
                setStatus(e.target.value as UserControllerUpdateBodyStatus)
              }
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Suspended / Inactive</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Role
            <select
              value={role ?? 'USER'}
              onChange={(e) =>
                setRole(e.target.value as UserControllerUpdateBodyRole)
              }
              className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-semibold">
            Reason for change
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Document the administrative reason for this update…"
              className="border-rewear-border rounded-lg border p-2.5 font-normal"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-[#BA1A1A]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-rewear-border min-h-11 rounded-lg border px-4 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 text-sm font-semibold disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function KycReviewModal({
  applicationId,
  onClose,
  onDecided,
}: {
  applicationId: string;
  onClose: () => void;
  onDecided: () => Promise<void>;
}) {
  const [outcome, setOutcome] = useState<
    'APPROVED' | 'NEEDS_INFO' | 'REJECTED'
  >('APPROVED');
  const [reason, setReason] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [error, setError] = useState('');

  const detailQuery = useQuery({
    queryKey: ['admin-kyc-detail', applicationId],
    queryFn: () => getAdminApplicationDetail(applicationId),
    retry: false,
  });

  const decideMutation = useMutation({
    mutationFn: () =>
      decideAdminApplication(applicationId, {
        outcome,
        reason: reason.trim(),
        adminNote: adminNote.trim(),
      }),
    onSuccess: () => onDecided(),
    onError: (err) => setError(getApiErrorMessage(err)),
  });

  const detail = detailQuery.data?.data;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-rewear-border max-h-[90dvh] max-w-[600px] overflow-y-auto rounded-lg border p-8">
        <DialogTitle>Review owner KYC</DialogTitle>
        <DialogDescription>
          Verify submitted CCCD/Passport documents and bank account details
          before approving.
        </DialogDescription>

        {detailQuery.isPending ? (
          <p role="status" className="text-rewear-muted text-sm">
            Loading application…
          </p>
        ) : detailQuery.isError || !detail ? (
          <p role="alert" className="text-sm text-[#BA1A1A]">
            Could not load KYC application detail.
          </p>
        ) : (
          <div className="space-y-5 text-sm">
            <div className="bg-rewear-soft grid gap-3 rounded-lg p-4 sm:grid-cols-2">
              <div>
                <p className="text-rewear-muted text-xs">Shop</p>
                <p className="font-semibold">{detail.shop.name}</p>
              </div>
              <div>
                <p className="text-rewear-muted text-xs">Application type</p>
                <p className="font-semibold">
                  {detail.kind} · {KYC_STATE_LABELS[detail.state]}
                </p>
              </div>
              {detail.identity && (
                <>
                  <div>
                    <p className="text-rewear-muted text-xs">Full legal name</p>
                    <p className="font-semibold">{detail.identity.fullName}</p>
                  </div>
                  <div>
                    <p className="text-rewear-muted text-xs">Document</p>
                    <p className="font-mono text-xs font-bold">
                      {detail.identity.documentType} ·{' '}
                      {detail.identity.documentNumber} (
                      {detail.identity.issuingCountry})
                    </p>
                  </div>
                  <div>
                    <p className="text-rewear-muted text-xs">Birth date</p>
                    <p className="font-mono text-xs">
                      {detail.identity.birthDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-rewear-muted text-xs">Expires on</p>
                    <p className="font-mono text-xs">
                      {detail.identity.expiresOn}
                    </p>
                  </div>
                </>
              )}
              {detail.bank && (
                <div className="sm:col-span-2">
                  <p className="text-rewear-muted text-xs">
                    Confirmed bank account
                  </p>
                  <p className="font-mono text-xs">
                    {detail.bank.bankCode} · {detail.bank.accountNumber} ·{' '}
                    {detail.bank.accountName}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold">
                Private identity documents ({detail.documents.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {detail.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() =>
                      void openApplicationDocumentDownload(doc.id).catch(
                        (err) => setError(getApiErrorMessage(err)),
                      )
                    }
                    className="border-rewear-border hover:bg-rewear-soft inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold"
                  >
                    <FileText size={14} />
                    Inspect {doc.slot}
                  </button>
                ))}
              </div>
            </div>

            {detail.state === 'SUBMITTED' && (
              <form
                className="border-rewear-border space-y-4 border-t pt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reason.trim().length < 3) return;
                  setError('');
                  decideMutation.mutate();
                }}
              >
                <label className="grid gap-1.5 font-semibold">
                  Decision
                  <select
                    value={outcome}
                    onChange={(e) =>
                      setOutcome(
                        e.target.value as
                          'APPROVED' | 'NEEDS_INFO' | 'REJECTED',
                      )
                    }
                    className="border-rewear-border min-h-11 rounded-lg border bg-white px-3 font-normal"
                  >
                    <option value="APPROVED">Approve KYC</option>
                    <option value="NEEDS_INFO">Request clearer info</option>
                    <option value="REJECTED">Reject application</option>
                  </select>
                </label>
                <label className="grid gap-1.5 font-semibold">
                  Reason (shown to seller, min 3 chars)
                  <textarea
                    required
                    minLength={3}
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Identity document and payout bank account verified."
                    className="border-rewear-border rounded-lg border p-2.5 font-normal"
                  />
                </label>
                <label className="grid gap-1.5 font-semibold">
                  Internal admin note (optional)
                  <input
                    type="text"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="border-rewear-border min-h-11 rounded-lg border px-3 font-normal"
                  />
                </label>
                {error && (
                  <p role="alert" className="text-sm text-[#BA1A1A]">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="border-rewear-border min-h-11 rounded-lg border px-4 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      decideMutation.isPending || reason.trim().length < 3
                    }
                    className="bg-rewear-accent text-rewear-text min-h-11 rounded-lg px-5 font-semibold disabled:opacity-50"
                  >
                    {decideMutation.isPending ? 'Saving…' : 'Submit decision'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
