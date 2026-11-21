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

export const QUICK_PRICE_PRESETS = [
  { label: 'Dưới 300k', min: '', max: '300000' },
  { label: '300k – 600k', min: '300000', max: '600000' },
  { label: '600k – 1tr', min: '600000', max: '1000000' },
  { label: 'Trên 1tr', min: '1000000', max: '' },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
  currentFilters: {
    categoryId?: string;
    size?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
  };
  onApply: (filters: {
    categoryId?: string;
    size?: string;
    condition?: string;
    minPrice?: string;
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
  const [selectedMinPrice, setSelectedMinPrice] = useState(
    currentFilters.minPrice ?? '',
  );
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(
    currentFilters.maxPrice ?? '',
  );

  const hasAnyFilter = Boolean(
    selectedCategory ||
      selectedSize ||
      selectedCondition ||
      selectedMinPrice ||
      selectedMaxPrice,
  );

  const handleApply = () => {
    onApply({
      categoryId: selectedCategory || undefined,
      size: selectedSize || undefined,
      condition: selectedCondition || undefined,
      minPrice: selectedMinPrice || undefined,
      maxPrice: selectedMaxPrice || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('');
    setSelectedSize('');
    setSelectedCondition('');
    setSelectedMinPrice('');
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

        {/* Price Section: Min - Max + Quick Presets */}
        <div className="bg-rewear-card flex flex-col gap-3 p-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-rewear-text text-sm leading-5 font-semibold">
              Price (₫)
            </span>
            {(selectedMinPrice || selectedMaxPrice) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMinPrice('');
                  setSelectedMaxPrice('');
                }}
                className="text-rewear-muted hover:text-rewear-text cursor-pointer text-xs font-semibold"
              >
                Reset price
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-rewear-surface flex h-14 flex-col justify-between px-3 py-1.5">
              <label
                htmlFor="filter-min-price"
                className="text-rewear-muted text-[11px] font-medium"
              >
                From
              </label>
              <input
                id="filter-min-price"
                type="number"
                min="0"
                step="10000"
                placeholder="0"
                value={selectedMinPrice}
                onChange={(e) => setSelectedMinPrice(e.target.value)}
                className="text-rewear-text w-full bg-transparent text-sm leading-5 font-normal outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            <div className="bg-rewear-surface flex h-14 flex-col justify-between px-3 py-1.5">
              <label
                htmlFor="filter-max-price"
                className="text-rewear-muted text-[11px] font-medium"
              >
                To
              </label>
              <input
                id="filter-max-price"
                type="number"
                min="0"
                step="10000"
                placeholder="No max"
                value={selectedMaxPrice}
                onChange={(e) => setSelectedMaxPrice(e.target.value)}
                className="text-rewear-text w-full bg-transparent text-sm leading-5 font-normal outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_PRICE_PRESETS.map((preset) => {
              const isSelected =
                selectedMinPrice === preset.min &&
                selectedMaxPrice === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMinPrice('');
                      setSelectedMaxPrice('');
                    } else {
                      setSelectedMinPrice(preset.min);
                      setSelectedMaxPrice(preset.max);
                    }
                  }}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs transition-colors ${
                    isSelected
                      ? 'bg-rewear-text text-rewear-surface font-semibold'
                      : 'bg-rewear-surface text-rewear-text hover:bg-rewear-soft font-normal'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
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
