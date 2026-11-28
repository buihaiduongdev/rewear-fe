'use client';

import { useMemo, useState } from 'react';

import { getApiErrorMessage } from '@/shared/api/api-error';
import type { CategoryControllerFindAll200DataItem } from '@/shared/api/models';
import {
  getCategoryControllerFindAllQueryKey,
  useCategoryControllerFindAll,
  useCategoryControllerUpdate,
} from '@/shared/api/query-generated/categories/categories';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Plus, Search } from 'lucide-react';

import { AdminCategoryModal } from './AdminCategoryModal';

type ActiveFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActiveFilter>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryControllerFindAll200DataItem | null>(null);
  const [feedback, setFeedback] = useState('');
  const [toggleError, setToggleError] = useState('');

  const categoriesQuery = useCategoryControllerFindAll({
    query: {
      meta: { skipErrorToast: true },
    },
  });

  const updateMutation = useCategoryControllerUpdate();

  const categories = useMemo(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data?.data],
  );

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return categories.filter((category) => {
      const matchesKeyword =
        !keyword ||
        category.name.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && category.isActive) ||
        (statusFilter === 'INACTIVE' && !category.isActive);
      return matchesKeyword && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  function refreshCategories(message: string) {
    setFeedback(message);
    setToggleError('');
    void queryClient.invalidateQueries({
      queryKey: getCategoryControllerFindAllQueryKey(),
    });
  }

  async function handleToggleActive(
    category: CategoryControllerFindAll200DataItem,
  ) {
    setToggleError('');
    setFeedback('');
    try {
      await updateMutation.mutateAsync({
        id: category.id,
        data: { isActive: !category.isActive },
      });
      refreshCategories(
        `${category.name} is now ${!category.isActive ? 'active' : 'inactive'}.`,
      );
    } catch (cause) {
      setToggleError(getApiErrorMessage(cause));
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[28px] leading-[36px] font-semibold tracking-[-0.02em] sm:text-[40px] sm:leading-[46px]">
            Categories
          </h1>
          <p className="text-rewear-muted text-sm">
            Manage flat clothing categories and required garment measurements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 inline-flex h-12 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[8px] px-5 text-sm font-semibold transition"
        >
          <Plus size={16} aria-hidden="true" />
          Add category
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-rewear-soft border-rewear-border focus-within:border-rewear-text flex h-11 w-full max-w-md items-center gap-2.5 rounded-[8px] border px-3.5 transition">
          <Search
            size={16}
            className="text-rewear-muted shrink-0"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or slug"
            className="text-rewear-text placeholder:text-rewear-muted w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={statusFilter === status}
              className={`min-h-11 cursor-pointer rounded-[8px] border px-3.5 text-xs font-semibold transition ${
                statusFilter === status
                  ? 'border-rewear-text bg-rewear-text text-rewear-surface'
                  : 'border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft'
              }`}
            >
              {status === 'ALL'
                ? 'All'
                : status === 'ACTIVE'
                  ? 'Active'
                  : 'Inactive'}
            </button>
          ))}
        </div>
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

      {toggleError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 p-3.5 text-sm text-[#BA1A1A]"
        >
          <AlertTriangle size={16} aria-hidden="true" />
          <span>{toggleError}</span>
        </div>
      )}

      {/* Categories Table */}
      <div className="border-rewear-border overflow-hidden rounded-[8px] border">
        {categoriesQuery.isPending ? (
          <div
            role="status"
            className="text-rewear-muted py-16 text-center text-sm"
          >
            Loading categories…
          </div>
        ) : categoriesQuery.isError ? (
          <div role="alert" className="space-y-3 py-16 text-center text-sm">
            <p className="text-[#BA1A1A]">Could not load categories.</p>
            <button
              type="button"
              onClick={() => void categoriesQuery.refetch()}
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
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Slug</th>
                  <th className="px-4 py-3 font-semibold">
                    Required measurements
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-rewear-border divide-y">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-rewear-soft/40 transition"
                  >
                    <td className="text-rewear-text px-4 py-3.5 font-semibold">
                      {category.name}
                    </td>
                    <td className="text-rewear-muted px-4 py-3.5 font-mono text-xs">
                      {category.slug}
                    </td>
                    <td className="text-rewear-muted px-4 py-3.5 text-xs capitalize">
                      {category.requiredMeasurements.length > 0
                        ? category.requiredMeasurements.join(', ')
                        : 'None'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-[8px] border px-2.5 py-1 text-xs font-semibold ${
                          category.isActive
                            ? 'border-rewear-text bg-rewear-accent text-rewear-text'
                            : 'border-rewear-border bg-rewear-soft text-rewear-muted'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(category);
                            setModalOpen(true);
                          }}
                          className="border-rewear-border text-rewear-text hover:bg-rewear-soft min-h-11 cursor-pointer rounded-[8px] border px-3 text-xs font-semibold transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={updateMutation.isPending}
                          onClick={() => void handleToggleActive(category)}
                          className="border-rewear-border text-rewear-muted hover:text-rewear-text hover:bg-rewear-soft min-h-11 cursor-pointer rounded-[8px] border px-3 text-xs font-semibold transition disabled:opacity-50"
                        >
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-rewear-muted py-14 text-center text-sm"
                    >
                      {categories.length === 0
                        ? 'No categories created yet.'
                        : 'No categories match the current filter.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminCategoryModal
        open={modalOpen}
        category={editingCategory}
        onClose={() => setModalOpen(false)}
        onSaved={refreshCategories}
      />
    </div>
  );
}
