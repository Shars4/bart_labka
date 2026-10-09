import { cn } from 'cn';
import type * as React from 'react';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn('animate-pulse rounded-xl bg-mist', className)}
      {...props}
    />
  );
}

export { Skeleton };
