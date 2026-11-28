'use client';

import { useState } from 'react';

import type { ProductControllerReviewQueue200DataDataItem } from '@/shared/api/models';
import {
  getProductControllerReviewQueueQueryKey,
  useProductControllerReviewQueue,
} from '@/shared/api/query-generated/products/products';
import { ProductPhoto } from '@/shared/components/marketplace/ProductPhoto';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/components/ui/pagination';
import { useDebounce } from '@/shared/hooks';
import { formatCondition, formatPrice } from '@/shared/utils/product';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Search } from 'lucide-react';

import { AdminReviewListingModal } from './AdminReviewListingModal';

export type ModerationStatusTab =
  'PENDING_REVIEW' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

const STATUS_TABS: Array<{ key: ModerationStatusTab; label: string }> = [
  { key: 'PENDING_REVIEW', label: 'Pending review' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING_REVIEW: 'border-amber-300 bg-amber-50 text-amber-900',
  ACTIVE: 'border-rewear-text bg-rewear-accent text-rewear-text',
  REJECTED: 'border-red-300 bg-red-50 text-[#BA1A1A]',
  SUSPENDED: 'border-red-300 bg-red-50 text-[#BA1A1A]',
};

const PAGE_LIMIT = 10;

export function AdminProductModerationPage() {
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] =
    useState<ModerationStatusTab>('PENDING_REVIEW');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [selectedListing, setSelectedListing] =
    useState<ProductControllerReviewQueue200DataDataItem | null>(null);
  const [feedback, setFeedback] = useState('');

  const debouncedSearch = useDebounce(searchInput.trim(), 300);

  const queueQuery = useProductControllerReviewQueue(
    {
      page,
      limit: PAGE_LIMIT,
      'filter.status': [statusTab],
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    },
    {
      query: {
        meta: { skipErrorToast: true },
      },
    },
  );

  const items = queueQuery.data?.data.data ?? [];
  const meta = queueQuery.data?.data.meta;
  const totalPages = meta?.totalPages ?? 1;

  function handleTabChange(nextTab: ModerationStatusTab) {
    setStatusTab(nextTab);
    setPage(1);
    setFeedback('');
  }

  function handleModerated(message: string) {
    setFeedback(message);
    void queryClient.invalidateQueries({
      queryKey: getProductControllerReviewQueueQueryKey(),
    });
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em] sm:text-[40px] sm:leading-[46px]">
          Product moderation
        </h1>
        <p className="text-rewear-muted text-sm">
          Review submitted secondhand listings, verify condition disclosures,
          and approve or reject items before publication.
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div
        role="tablist"
        aria-label="Moderation status filter"
        className="border-rewear-border flex flex-wrap gap-2 border-b pb-4"
      >
        {STATUS_TABS.map((tab) => {
          const isSelected = statusTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => handleTabChange(tab.key)}
              className={`min-h-11 cursor-pointer rounded-[8px] border px-4 text-sm font-semibold transition ${
                isSelected
                  ? 'border-rewear-text bg-rewear-text text-rewear-surface'
                  : 'border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Count */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-rewear-soft border-rewear-border focus-within:border-rewear-text flex h-11 w-full max-w-md items-center gap-2.5 rounded-[8px] border px-3.5 transition">
          <Search
            size={16}
            className="text-rewear-muted shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search listings"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            placeholder="Search by listing title or brand"
            className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-sm outline-none"
          />
        </div>

        {meta && (
          <p className="text-rewear-muted font-mono text-xs font-semibold">
            {meta.totalItems ?? 0}{' '}
            {(meta.totalItems ?? 0) === 1 ? 'listing' : 'listings'}
          </p>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className="border-rewear-text bg-rewear-accent/25 text-rewear-text flex items-center gap-2 rounded-[8px] border p-3.5 text-sm font-semibold"
        >
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Queue Table */}
      <div className="border-rewear-border overflow-hidden rounded-[8px] border">
        {queueQuery.isPending ? (
          <div
            role="status"
            className="text-rewear-muted py-16 text-center text-sm"
          >
            Loading listings…
          </div>
        ) : queueQuery.isError ? (
          <div role="alert" className="space-y-3 py-16 text-center text-sm">
            <p className="text-[#BA1A1A]">Could not load moderation queue.</p>
            <button
              type="button"
              onClick={() => void queueQuery.refetch()}
              className="border-rewear-border text-rewear-text hover:bg-rewear-soft min-h-11 cursor-pointer rounded-[8px] border px-4 font-semibold"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-rewear-border text-rewear-muted border-b bg-[#FAF9F6]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Listing</th>
                  <th className="px-4 py-3 font-semibold">Shop</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-rewear-border divide-y">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-rewear-soft/40 transition"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="bg-rewear-soft relative h-16 w-12 shrink-0 overflow-hidden rounded-[6px]">
                          <ProductPhoto
                            url={item.coverUrl}
                            title={item.title}
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-rewear-text truncate font-semibold">
                            {item.title ?? 'Untitled listing'}
                          </p>
                          <p className="text-rewear-muted text-xs">
                            {item.category?.name ?? 'No category'} ·{' '}
                            {formatCondition(item.condition) ?? 'Unknown'} ·{' '}
                            {item.mediaCount} photos
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-rewear-text px-4 py-3.5 font-medium">
                      {item.shop.name}
                    </td>
                    <td className="text-rewear-text px-4 py-3.5 font-mono font-semibold tabular-nums">
                      {formatPrice(item.price)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-[8px] border px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLE[item.status] ??
                          'border-rewear-border bg-rewear-soft text-rewear-text'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedListing(item)}
                        className="border-rewear-border text-rewear-text hover:bg-rewear-soft inline-flex min-h-11 cursor-pointer items-center justify-center rounded-[8px] border px-3.5 text-xs font-semibold transition"
                      >
                        {item.status === 'PENDING_REVIEW'
                          ? 'Review'
                          : 'View snapshot'}
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-rewear-muted py-14 text-center text-sm"
                    >
                      No listings found in this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && (meta.totalItems ?? 0) > 0 && (
          <div className="border-rewear-border flex items-center justify-between border-t px-4 py-3">
            <span className="text-rewear-muted font-mono text-xs">
              Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={page <= 1 || queueQuery.isFetching}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    disabled={page >= totalPages || queueQuery.isFetching}
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <AdminReviewListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onModerated={handleModerated}
      />
    </div>
  );
}
