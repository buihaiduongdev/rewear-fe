'use client';

import { useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type {
  CategoryControllerCreateBodyRequiredMeasurementsItem,
  CategoryControllerFindAll200DataItem,
} from '@/shared/api/models';
import {
  useCategoryControllerCreate,
  useCategoryControllerUpdate,
} from '@/shared/api/query-generated/categories/categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

const MEASUREMENT_OPTIONS: CategoryControllerCreateBodyRequiredMeasurementsItem[] =
  ['chest', 'waist', 'hip', 'length', 'shoulder', 'sleeve', 'inseam'];

function toSlugPreview(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface AdminCategoryModalProps {
  open: boolean;
  category: CategoryControllerFindAll200DataItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function AdminCategoryModal({
  open,
  category,
  onClose,
  onSaved,
}: AdminCategoryModalProps) {
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [requiredMeasurements, setRequiredMeasurements] = useState<
    CategoryControllerCreateBodyRequiredMeasurementsItem[]
  >([]);
  const [error, setError] = useState('');
  const [syncKey, setSyncKey] = useState('');

  const nextSyncKey = open ? `${category?.id ?? 'new'}` : '';
  if (syncKey !== nextSyncKey) {
    setSyncKey(nextSyncKey);
    setName(category?.name ?? '');
    setIsActive(category?.isActive ?? true);
    setRequiredMeasurements(category?.requiredMeasurements ?? []);
    setError('');
  }

  const createMutation = useCategoryControllerCreate();
  const updateMutation = useCategoryControllerUpdate();
  const busy = createMutation.isPending || updateMutation.isPending;

  const computedSlug = toSlugPreview(name) || category?.slug || '';

  function toggleMeasurement(
    field: CategoryControllerCreateBodyRequiredMeasurementsItem,
  ) {
    setRequiredMeasurements((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }
    if (!toSlugPreview(trimmedName)) {
      setError('Category name must produce a valid slug.');
      return;
    }
    setError('');

    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: {
            name: trimmedName,
            isActive,
            requiredMeasurements,
          },
        });
        onSaved(`Updated category "${trimmedName}".`);
      } else {
        await createMutation.mutateAsync({
          data: {
            name: trimmedName,
            isActive,
            requiredMeasurements,
          },
        });
        onSaved(`Created category "${trimmedName}".`);
      }
      onClose();
    } catch (cause) {
      setError(getApiErrorMessage(cause));
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !busy) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-[8px] border p-6 shadow-2xl sm:max-w-[520px] md:p-8"
      >
        <div className="flex items-center justify-between pb-1">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="text-rewear-text hover:text-rewear-muted min-h-11 cursor-pointer text-sm font-semibold transition disabled:opacity-50"
          >
            Close ×
          </button>
        </div>

        <DialogHeader className="gap-1">
          <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            {category ? 'Category details' : 'New category'}
          </DialogTitle>
          <DialogDescription>
            Flat marketplace category shown to buyers and sellers.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-5 pt-2"
        >
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3 text-sm text-[#BA1A1A]"
            >
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div className="bg-rewear-soft border-rewear-border flex min-h-20 flex-col justify-between rounded-[8px] border px-4 py-3">
            <label
              htmlFor="category-name"
              className="text-rewear-text text-sm font-semibold"
            >
              Name
            </label>
            <input
              id="category-name"
              type="text"
              maxLength={100}
              disabled={busy}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Outerwear"
              className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-base outline-none"
            />
          </div>

          {/* Slug preview (auto-generated by backend) */}
          <div className="bg-rewear-soft/60 border-rewear-border flex min-h-20 flex-col justify-between rounded-[8px] border px-4 py-3">
            <label
              htmlFor="category-slug"
              className="text-rewear-muted text-sm font-semibold"
            >
              Slug (auto-generated)
            </label>
            <input
              id="category-slug"
              type="text"
              readOnly
              value={computedSlug}
              placeholder="outerwear"
              className="text-rewear-muted w-full bg-transparent font-mono text-sm outline-none"
            />
          </div>

          {/* Active toggle */}
          <label className="border-rewear-border bg-rewear-surface flex min-h-12 cursor-pointer items-center justify-between rounded-[8px] border px-4 py-3">
            <span className="space-y-0.5">
              <span className="text-rewear-text block text-sm font-semibold">
                Active
              </span>
              <span className="text-rewear-muted block text-xs">
                Active categories are visible in catalog filters and seller
                listing forms.
              </span>
            </span>
            <input
              type="checkbox"
              aria-label="Active"
              checked={isActive}
              disabled={busy}
              onChange={(event) => setIsActive(event.target.checked)}
              className="accent-rewear-text size-5 cursor-pointer"
            />
          </label>

          {/* Required measurements */}
          <fieldset className="space-y-2.5">
            <legend className="text-rewear-text text-sm font-semibold">
              Required measurements
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {MEASUREMENT_OPTIONS.map((field) => {
                const checked = requiredMeasurements.includes(field);
                return (
                  <label
                    key={field}
                    className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-[8px] border px-3 text-xs font-semibold capitalize transition ${
                      checked
                        ? 'border-rewear-text bg-rewear-soft text-rewear-text'
                        : 'border-rewear-border bg-rewear-surface text-rewear-muted'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={busy}
                      onChange={() => toggleMeasurement(field)}
                      className="accent-rewear-text size-4"
                    />
                    {field}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={busy}
            className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full cursor-pointer items-center justify-center rounded-[8px] text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'Saving…' : category ? 'Save changes' : 'Create category'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
