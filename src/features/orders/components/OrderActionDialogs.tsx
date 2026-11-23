'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  DisputeControllerOpenBodyKind,
  DisputeControllerUploadBodyTagsItem,
} from '@/shared/api/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function CancelOrderDialog({
  cancel,
  pending,
  error,
  request = false,
}: {
  request?: boolean;
  cancel: () => Promise<unknown>;
  pending: boolean;
  error: unknown;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="border-rewear-border min-h-12 w-full border font-semibold transition-colors hover:border-red-700 hover:bg-red-700 hover:text-white"
        onClick={() => setOpen(true)}
      >
        {request ? 'Request cancellation' : 'Cancel order'}
      </button>
      <DialogContent>
        <DialogTitle>
          {request ? 'Request cancellation?' : 'Cancel this order?'}
        </DialogTitle>
        <DialogDescription>
          {request
            ? 'The seller will review your request. The order remains active until cancellation is approved.'
            : 'This cancels the order before the seller confirms it. Repeated COD cancellations may restrict future COD orders.'}
        </DialogDescription>
        {Boolean(error) && (
          <p role="alert" className="text-red-700">
            {getApiErrorMessage(error)}
          </p>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="min-h-11 px-4"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Keep order
          </button>
          <button
            type="button"
            className="bg-rewear-text min-h-11 px-4 text-white disabled:opacity-50"
            disabled={pending}
            onClick={() =>
              void cancel()
                .then(() => setOpen(false))
                .catch(() => {})
            }
          >
            {pending
              ? 'Sending…'
              : request
                ? 'Request cancellation'
                : 'Cancel order'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReportIssueDialog({
  items,
  report,
  pending,
  error,
}: {
  items: { id: string; title: string }[];
  report: (input: {
    productId: string;
    kind: DisputeControllerOpenBodyKind;
    description: string;
    files: File[];
    tags: DisputeControllerUploadBodyTagsItem[];
  }) => Promise<void>;
  pending: boolean;
  error: unknown;
}) {
  const [open, setOpen] = useState(false);
  const [productId, setProductId] = useState(items[0]?.id ?? '');
  const [kind, setKind] =
    useState<DisputeControllerOpenBodyKind>('NOT_AS_DESCRIBED');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const [tags, setTags] = useState<DisputeControllerUploadBodyTagsItem[]>([]);
  const submit = async () => {
    if (!productId || !description.trim()) return;
    if (
      files.length > 10 ||
      files.some(
        (f) =>
          ![
            'image/jpeg',
            'image/png',
            'image/webp',
            'video/mp4',
            'video/webm',
          ].includes(f.type) ||
          f.size === 0 ||
          f.size > (f.type.startsWith('video/') ? 100 : 10) * 1024 * 1024,
      )
    ) {
      setFileError(
        'Choose up to 10 JPG, PNG, WebP, MP4 or WebM files (images up to 10 MB, videos up to 100 MB).',
      );
      return;
    }
    const required =
      kind === 'MISSING_ITEM'
        ? ['PARCEL', 'LABEL', 'RECEIVED_ITEMS']
        : kind === 'TRANSIT_DAMAGE'
          ? ['PARCEL', 'LABEL', 'DAMAGE']
          : ['ISSUE'];
    if (
      !files.length ||
      !required.every((tag) =>
        tags.includes(tag as DisputeControllerUploadBodyTagsItem),
      )
    ) {
      setFileError(
        'Attach evidence and select all required categories for this issue.',
      );
      return;
    }
    setFileError('');
    try {
      await report({ productId, kind, description, files, tags });
      setOpen(false);
    } catch {
      /* error is displayed below */
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="border-rewear-border min-h-12 w-full border font-semibold"
        onClick={() => setOpen(true)}
      >
        Report an issue
      </button>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>Report an issue</DialogTitle>
        <DialogDescription>
          Tell us what happened and attach photos or video as evidence.
        </DialogDescription>
        <label className="grid gap-1">
          Item
          <select
            className="border-rewear-border min-h-11 border p-2"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          Issue
          <select
            className="border-rewear-border min-h-11 border p-2"
            value={kind}
            onChange={(e) =>
              setKind(e.target.value as DisputeControllerOpenBodyKind)
            }
          >
            <option value="NOT_AS_DESCRIBED">Not as described</option>
            <option value="WRONG_ITEM">Wrong item</option>
            <option value="MISSING_ITEM">Missing item</option>
            <option value="TRANSIT_DAMAGE">Damaged in transit</option>
          </select>
        </label>
        <label className="grid gap-1">
          Description
          <textarea
            className="border-rewear-border min-h-24 border p-2"
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label className="grid gap-1">
          Evidence
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {files.length > 0 && (
          <fieldset className="space-y-2">
            <legend>What do these files show?</legend>
            <p className="text-rewear-muted text-sm">
              Select all that apply to the files you attach.
            </p>
            {(
              [
                ['ISSUE', 'The item or issue'],
                ['PARCEL', 'The parcel'],
                ['LABEL', 'Shipping label'],
                ['RECEIVED_ITEMS', 'All received items'],
                ['DAMAGE', 'Damage'],
                ['PACKING', 'Packaging'],
                ['UNBOX', 'Unboxing'],
              ] as const
            ).map(([value, label]) => (
              <label
                key={value}
                className="mr-4 inline-flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={tags.includes(value)}
                  onChange={(event) =>
                    setTags(
                      event.target.checked
                        ? [...tags, value]
                        : tags.filter((tag) => tag !== value),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        <p className="text-rewear-muted text-sm">
          Missing-item reports require parcel, label and received-items
          evidence; transit damage requires parcel, label and damage. Other
          issues require evidence of the issue.
        </p>
        {(fileError || Boolean(error)) && (
          <p role="alert" className="text-red-700">
            {fileError || getApiErrorMessage(error)}
          </p>
        )}
        <button
          type="button"
          disabled={pending || !productId || !description.trim()}
          className="bg-rewear-text min-h-12 px-4 font-semibold text-white disabled:opacity-50"
          onClick={() => void submit()}
        >
          {pending ? 'Sending…' : 'Send report'}
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function SupplementEvidenceDialog({
  submitEvidence,
  pending,
  error,
}: {
  submitEvidence: (
    files: File[],
    tags: DisputeControllerUploadBodyTagsItem[],
  ) => Promise<void>;
  pending: boolean;
  error: unknown;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [tag, setTag] = useState<DisputeControllerUploadBodyTagsItem>('ISSUE');
  const [validation, setValidation] = useState('');
  const submit = async () => {
    if (!file) return;
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
    ];
    if (
      !allowed.includes(file.type) ||
      !file.size ||
      file.size > (file.type.startsWith('video/') ? 100 : 10) * 1024 * 1024
    ) {
      setValidation(
        'Choose a JPG, PNG, WebP, MP4 or WebM file within the size limit.',
      );
      return;
    }
    setValidation('');
    try {
      await submitEvidence([file], [tag]);
      setOpen(false);
      setFile(null);
    } catch {
      /* mutation error is displayed */
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        className="min-h-11 font-semibold underline"
        onClick={() => setOpen(true)}
      >
        Add evidence
      </button>
      <DialogContent>
        <DialogTitle>Add evidence</DialogTitle>
        <DialogDescription>
          Attach another photo or video to your report. Images can be up to 10
          MB, videos up to 100 MB.
        </DialogDescription>
        <label className="grid gap-1">
          What does this file show?
          <select
            value={tag}
            onChange={(event) =>
              setTag(event.target.value as DisputeControllerUploadBodyTagsItem)
            }
            className="border-rewear-border min-h-11 border p-2"
          >
            <option value="ISSUE">Item or issue</option>
            <option value="PARCEL">Parcel</option>
            <option value="LABEL">Shipping label</option>
            <option value="RECEIVED_ITEMS">Received items</option>
            <option value="DAMAGE">Damage</option>
            <option value="PACKING">Packaging</option>
            <option value="UNBOX">Unboxing</option>
          </select>
        </label>
        <label className="grid gap-1">
          Evidence
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {(validation || Boolean(error)) && (
          <p role="alert" className="text-red-700">
            {validation || getApiErrorMessage(error)}
          </p>
        )}
        <button
          type="button"
          disabled={!file || pending}
          className="bg-rewear-text min-h-11 px-4 font-semibold text-white disabled:opacity-50"
          onClick={() => void submit()}
        >
          {pending ? 'Uploading…' : 'Add evidence'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
