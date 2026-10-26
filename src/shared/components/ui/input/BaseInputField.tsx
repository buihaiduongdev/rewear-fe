import type { ComponentProps, ReactNode } from 'react';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';

import { Input } from '../input';

export interface BaseInputFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
  appearance?: 'default' | 'filled';
}

export function BaseInputField({
  label,
  appearance = 'default',
  error,
  endAdornment,
  className,
  ...props
}: BaseInputFieldProps) {
  return (
    <div className={appearance === 'filled' ? '' : 'mb-5'}>
      <div
        className={
          appearance === 'filled'
            ? cn(
                'rounded-[8px] bg-[#f3f3f5] px-4 py-3 focus-within:ring-2 focus-within:ring-[#1a1c1d]/30',
                error &&
                  'ring-destructive focus-within:ring-destructive ring-1',
              )
            : undefined
        }
      >
        <label
          htmlFor={props.id}
          className={
            appearance === 'filled'
              ? 'mb-2 block text-sm leading-5 font-semibold'
              : 'text-foreground mb-1.5 block text-xs font-medium'
          }
        >
          {label}
        </label>
        <div className="relative">
          <Input
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${props.id}-error` : undefined}
            className={cn(
              appearance === 'filled'
                ? 'h-6 rounded-none border-0 bg-transparent px-0 py-0 text-base leading-6 shadow-none ring-0 placeholder:text-[#5f5e5e] focus-visible:ring-0 aria-invalid:ring-0 md:text-base dark:bg-transparent'
                : 'h-10 rounded-md px-3 py-2 text-sm',
              error &&
                appearance === 'default' &&
                'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 aria-invalid:ring-destructive/20',
              className,
            )}
            {...props}
          />
          {endAdornment}
        </div>
      </div>
      {error ? (
        <p
          id={`${props.id}-error`}
          className="text-destructive mt-1.5 flex items-center gap-1 text-xs"
        >
          <HugeiconsIcon
            icon={AlertCircleIcon}
            size={14}
            className="shrink-0"
          />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
