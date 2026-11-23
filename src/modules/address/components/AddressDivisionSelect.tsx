'use client';

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/ui/combobox';

type DivisionOption = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DivisionOption[];
  placeholder: string;
  emptyText: string;
  disabled?: boolean;
  rounded?: boolean;
  error?: string;
  errorClassName?: string;
};

function normalizeVietnamese(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function AddressDivisionSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  emptyText,
  disabled,
  rounded,
  error,
  errorClassName = 'text-destructive',
}: Props) {
  const selected = options.find((option) => option.value === value) ?? null;
  return (
    <div>
      <div
        className={`bg-rewear-soft block space-y-1.5 px-4 py-3 ${rounded ? 'rounded-lg' : ''}`}
      >
        <span className="text-rewear-muted block text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
        <Combobox<DivisionOption>
          items={options}
          value={selected}
          onValueChange={(option: DivisionOption | null) =>
            onChange(option?.value ?? '')
          }
          filter={(item: DivisionOption, query: string) =>
            normalizeVietnamese(item?.label ?? '').includes(
              normalizeVietnamese(query.trim()),
            )
          }
          itemToStringLabel={(item: DivisionOption) => item?.label ?? ''}
          itemToStringValue={(item: DivisionOption) => item?.value ?? ''}
          isItemEqualToValue={(a: DivisionOption, b: DivisionOption) =>
            a?.value === b?.value
          }
          disabled={disabled}
        >
          <ComboboxInput
            aria-label={label}
            placeholder={placeholder}
            showTrigger
            showClear={!!value}
            className="h-8 w-full border-0 bg-transparent px-0 text-sm font-medium shadow-none focus-within:ring-0"
          />
          <ComboboxContent className="max-h-60 overflow-y-auto">
            <ComboboxEmpty className="text-rewear-muted py-3 text-center text-xs">
              {emptyText}
            </ComboboxEmpty>
            <ComboboxList>
              <ComboboxCollection>
                {(item: DivisionOption) => (
                  <ComboboxItem
                    key={item.value}
                    value={item}
                    className="hover:bg-rewear-soft cursor-pointer px-3 py-2 text-sm"
                  >
                    {item.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      {error && (
        <p className={`mt-2 text-sm ${errorClassName}`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
