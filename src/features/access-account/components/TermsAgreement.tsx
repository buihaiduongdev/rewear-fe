'use client';

import { Checkbox } from '@/shared/components/ui/checkbox';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

type TTermsAgreementProps = {
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
};

export function TermsAgreement({
  isChecked,
  onCheckedChange,
  error,
}: TTermsAgreementProps) {
  return (
    <div className="mb-5">
      <div className="text-muted-foreground flex items-start gap-2.5 text-xs leading-relaxed">
        <Checkbox
          id="acceptedTerms"
          checked={isChecked}
          onCheckedChange={onCheckedChange}
        />
        <label
          htmlFor="acceptedTerms"
          className="cursor-pointer pt-0.5 leading-none select-none"
        >
          I agree to the Terms of Service and Privacy Policy.
        </label>
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
