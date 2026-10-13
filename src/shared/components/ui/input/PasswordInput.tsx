'use client';

import { useState } from 'react';

import { EyeIcon, EyeOffIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from 'cn';

import { BaseInputField, type BaseInputFieldProps } from './BaseInputField';

export type TPasswordInputProps = Omit<
  BaseInputFieldProps,
  'label' | 'type'
> & {
  label?: string;
};

export function PasswordInput({
  label = 'Password',
  ...props
}: TPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <BaseInputField
      {...props}
      id={props.id ?? 'password'}
      type={showPassword ? 'text' : 'password'}
      label={label}
      error={props.error}
      className={cn(props.className, 'pr-10')}
      placeholder={props.placeholder ?? 'Enter your password'}
      endAdornment={
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
          onClick={() => setShowPassword((value) => !value)}
        >
          <HugeiconsIcon icon={showPassword ? EyeOffIcon : EyeIcon} size={16} />
        </button>
      }
    />
  );
}
