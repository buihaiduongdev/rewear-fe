'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { PRODUCT_CONDITION_LABELS } from '@/shared/utils/product';

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size'];

export const PRICE_OPTIONS = [
  { label: 'All prices', value: '' },
  { label: 'Up to 300.000₫', value: '300000' },
  { label: 'Up to 500.000₫', value: '500000' },
  { label: 'Up to 800.000₫', value: '800000' },
  { label: 'Up to 1.200.000₫', value: '1200000' },
  { label: 'Up to 2.000.000₫', value: '2000000' },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
  currentFilters: {
    categoryId?: string;
    size?: string;
    condition?: string;
    maxPrice?: string;
  };
  onApply: (filters: {
    categoryId?: string;
    size?: string;
    condition?: string;
    maxPrice?: string;
  }) => void;
  onReset: () => void;
};

function FilterForm({
  categories,
  currentFilters,
  onApply,
  onReset,
  onClose,
}: Omit<Props, 'isOpen'>) {
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.categoryId ?? '',
  );
  const [selectedSize, setSelectedSize] = useState(currentFilters.size ?? '');
  const [selectedCondition, setSelectedCondition] = useState(
    currentFilters.condition ?? '',
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(
    currentFilters.maxPrice ?? '',
  );

  const hasAnyFilter = Boolean(
    selectedCategory || selectedSize || selectedCondition || selectedMaxPrice,
  );

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory || undefined,
      size: selectedSize || undefined,
      condition: selectedCondition || undefined,
      maxPrice: selectedMaxPrice || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedCondition('');
    setSelectedMaxPrice('');
    onReset();
    onClose();
  };

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onClose}
          className="text-rewear-text hover:opacity-70 cursor-pointer text-sm font-semibold transition"
        >
          Close ×
        </button>
      </div>

      <DialogHeader className="gap-1">
        <DialogTitle className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Filters
        </DialogTitle>
        <DialogDescription className="sr-only">
          Filter garments by category, size, condition, and price.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        {/* Category Field */}
        <div className="bg-rewear-card flex h-20 flex-col justify-between p-3 px-4">
          <label
            htmlFor="filter-category"
            className="text-rewear-text text-sm leading-5 font-semibold"
          >
            Category
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-rewear-text w-full cursor-pointer bg-transparent text-base leading-6 outline-none"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Size Field */}
        <div className="bg-rewear-card flex h-20 flex-col justify-between p-3 px-4">
          <label
            htmlFor="filter-size"
            className="text-rewear-text text-sm leading-5 font-semibold"
          >
            Size
          </label>
          <select
            id="filter-size"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="text-rewear-text w-full cursor-pointer bg-transparent text-base leading-6 outline-none"
          >
            <option value="">All sizes</option>
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Condition Field */}
        <div className="bg-rewear-card flex h-20 flex-col justify-between p-3 px-4">
          <label
            htmlFor="filter-condition"
            className="text-rewear-text text-sm leading-5 font-semibold"
          >
            Condition
          </label>
          <select
            id="filter-condition"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="text-rewear-text w-full cursor-pointer bg-transparent text-base leading-6 outline-none"
          >
            <option value="">All conditions</option>
            {Object.entries(PRODUCT_CONDITION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Field */}
        <div className="bg-rewear-card flex h-20 flex-col justify-between p-3 px-4">
          <label
            htmlFor="filter-price"
            className="text-rewear-text text-sm leading-5 font-semibold"
          >
            Price
          </label>
          <select
            id="filter-price"
            value={selectedMaxPrice}
            onChange={(e) => setSelectedMaxPrice(e.target.value)}
            className="text-rewear-text w-full cursor-pointer bg-transparent text-base leading-6 outline-none"
          >
            {PRICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full cursor-pointer items-center justify-center text-sm font-normal transition-colors"
        >
          Show items
        </button>
        {hasAnyFilter && (
          <button
            type="button"
            onClick={handleReset}
            className="text-rewear-muted hover:text-rewear-text cursor-pointer text-center text-xs font-semibold underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </>
  );
}

export function ProductFilterModal({
  isOpen,
  onClose,
  categories,
  currentFilters,
  onApply,
  onReset,
}: Props) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-rewear-border bg-rewear-surface max-w-[520px] rounded-none border p-6 shadow-2xl sm:max-w-[520px] md:p-8"
      >
        {isOpen && (
          <FilterForm
            categories={categories}
            currentFilters={currentFilters}
            onApply={onApply}
            onReset={onReset}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
