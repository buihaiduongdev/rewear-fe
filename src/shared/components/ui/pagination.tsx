'use client';

import * as React from 'react';

import { cn } from 'cn';
import { ChevronDownIcon, MoreHorizontalIcon } from 'lucide-react';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn(
        'flex w-full flex-col items-center justify-between gap-4 md:flex-row',
        className,
      )}
      {...props}
    />
  );
}

function PaginationPageSize({
  value,
  onChange,
  options = [12, 24, 48],
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div
      className={cn('flex items-center gap-2.5 text-sm', className)}
      data-slot="pagination-page-size"
    >
      <span className="text-rewear-muted font-normal">Items per page</span>
      <div className="border-rewear-border bg-rewear-surface relative flex h-10 w-[68px] items-center justify-between border px-3">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-rewear-text absolute inset-0 w-full cursor-pointer appearance-none bg-transparent px-3 text-sm font-normal outline-none"
          aria-label="Items per page"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <span className="text-rewear-text pointer-events-none text-sm font-normal">
          {value}
        </span>
        <ChevronDownIcon className="text-rewear-muted pointer-events-none size-3.5 shrink-0" />
      </div>
    </div>
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationButtonProps = {
  isActive?: boolean;
  disabled?: boolean;
} & React.ComponentProps<'button'>;

function PaginationLink({
  className,
  isActive,
  disabled,
  children,
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      aria-current={isActive ? 'page' : undefined}
      disabled={disabled}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        'flex h-10 min-w-10 cursor-pointer items-center justify-center px-4 text-sm font-normal transition-colors select-none',
        isActive
          ? 'bg-rewear-accent text-rewear-text font-normal'
          : 'bg-rewear-card text-rewear-text hover:bg-black/5',
        disabled && 'pointer-events-none cursor-default opacity-45',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function PaginationPrevious({
  className,
  text = 'Previous',
  disabled,
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      disabled={disabled}
      className={cn('h-10 px-5 font-normal', className)}
      {...props}
    >
      ‹ {text}
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  text = 'Next',
  disabled,
  ...props
}: PaginationButtonProps & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      disabled={disabled}
      className={cn('h-10 px-5 font-normal', className)}
      {...props}
    >
      {text} ›
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        'text-rewear-muted flex size-10 items-center justify-center',
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPageSize,
  PaginationPrevious,
};
