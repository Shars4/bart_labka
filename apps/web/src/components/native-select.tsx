import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';
import type * as React from 'react';

/**
 * A styled native <select>: works without JavaScript, inside plain GET
 * forms, and opens the platform's own picker on phones.
 */
export function NativeSelect({
  className,
  children,
  ...props
}: React.ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          'h-11 w-full cursor-pointer appearance-none rounded-xl border border-input bg-background pr-10 pl-3.5 text-base text-foreground outline-none focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-ring aria-invalid:border-destructive',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2"
      />
    </div>
  );
}
