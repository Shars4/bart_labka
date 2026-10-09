import { cn } from 'cn';
import type * as React from 'react';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-28 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-mist disabled:opacity-60 aria-invalid:border-destructive aria-invalid:outline-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
