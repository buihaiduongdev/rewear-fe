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
import { Slider } from '@base-ui/react/slider';

const MAX_SLIDER_PRICE = 2000000;
const SLIDER_STEP = 50000;

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free size'];

export const QUICK_PRICE_PRESETS = [
  { label: 'Under 300k', min: '', max: '300000' },
  { label: '300k – 600k', min: '300000', max: '600000' },
  { label: '600k – 1M', min: '600000', max: '1000000' },
  { label: 'Over 1M', min: '1000000', max: '' },
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
};

function FilterForm({
  categories,
  currentFilters,
  onApply,
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

  const minVal = selectedMinPrice
    ? Math.min(Math.max(Number(selectedMinPrice), 0), MAX_SLIDER_PRICE)
    : 0;
  const maxVal = selectedMaxPrice
    ? Math.min(Math.max(Number(selectedMaxPrice), 0), MAX_SLIDER_PRICE)
    : MAX_SLIDER_PRICE;

  const formatVnd = (num: number) =>
    new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num) +
    '₫';

  const priceRangeText =
    !selectedMinPrice && !selectedMaxPrice
      ? 'All prices'
      : selectedMinPrice && selectedMaxPrice
        ? `${formatVnd(Number(selectedMinPrice))} – ${formatVnd(Number(selectedMaxPrice))}`
        : selectedMinPrice
          ? `From ${formatVnd(Number(selectedMinPrice))}`
          : `Up to ${formatVnd(Number(selectedMaxPrice))}`;

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

  return (
    <>
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onClose}
          className="text-rewear-text cursor-pointer text-sm font-semibold transition hover:opacity-70"
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
        <div className="bg-rewear-soft border-rewear-border flex h-20 flex-col justify-between border p-3 px-4">
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
        <div className="bg-rewear-soft border-rewear-border flex h-20 flex-col justify-between border p-3 px-4">
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
        <div className="bg-rewear-soft border-rewear-border flex h-20 flex-col justify-between border p-3 px-4">
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

        {/* Price Section: Slider + Quick Presets Grid */}
        <div className="bg-rewear-soft border-rewear-border flex flex-col gap-4 border p-4">
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

          {/* Range Slider & Value Display */}
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rewear-text font-semibold">
                {priceRangeText}
              </span>
            </div>
            <Slider.Root
              value={[minVal, maxVal]}
              onValueChange={(val) => {
                const [min, max] = val as [number, number];
                setSelectedMinPrice(min === 0 ? '' : String(min));
                setSelectedMaxPrice(max >= MAX_SLIDER_PRICE ? '' : String(max));
              }}
              min={0}
              max={MAX_SLIDER_PRICE}
              step={SLIDER_STEP}
              className="relative flex w-full touch-none items-center py-2 select-none"
            >
              <Slider.Control className="relative flex w-full items-center">
                <Slider.Track className="bg-rewear-border relative h-1.5 w-full grow overflow-hidden rounded-full">
                  <Slider.Indicator className="bg-rewear-text absolute h-full rounded-full" />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  aria-label="Minimum price"
                  className="border-rewear-text bg-rewear-surface focus-visible:ring-rewear-text block size-5 cursor-grab rounded-full border-2 shadow-sm transition hover:scale-110 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
                />
                <Slider.Thumb
                  index={1}
                  aria-label="Maximum price"
                  className="border-rewear-text bg-rewear-surface focus-visible:ring-rewear-text block size-5 cursor-grab rounded-full border-2 shadow-sm transition hover:scale-110 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
                />
              </Slider.Control>
            </Slider.Root>
          </div>

          {/* Quick presets as rectangular boxes filling parent width */}
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
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
                  className={`flex h-11 w-full cursor-pointer items-center justify-center border text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-rewear-text bg-rewear-text text-rewear-surface shadow-sm'
                      : 'border-rewear-border bg-rewear-surface text-rewear-text hover:bg-rewear-soft'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="bg-rewear-accent text-rewear-text hover:bg-rewear-accent/90 flex h-12 w-full cursor-pointer items-center justify-center text-sm font-normal transition-colors"
        >
          Show items
        </button>
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
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
