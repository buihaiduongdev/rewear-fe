import * as React from 'react';

import { cn } from 'cn';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-rewear-soft rounded-md motion-safe:animate-pulse',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
