import type { ComponentProps, ReactNode } from 'react';

import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';

import { Input } from '../input';

export interface BaseInputFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
  endAdornment?: ReactNode;
}

export function BaseInputField({
  label,
  error,
  endAdornment,
  className,
  ...props
}: BaseInputFieldProps) {
  return (
    <div className="mb-5">
      <label
        htmlFor={props.id}
        className="text-foreground mb-1.5 block text-xs font-medium"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          aria-invalid={Boolean(error)}
          className={cn(
            'h-10 rounded-md px-3 py-2 text-sm',
            error &&
              'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 aria-invalid:ring-destructive/20',
            className,
          )}
          {...props}
        />
        {endAdornment}
      </div>
      {error ? (
        <p className="text-destructive mt-1.5 flex items-center gap-1 text-xs">
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
