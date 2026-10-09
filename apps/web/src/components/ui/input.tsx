import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';
import type * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-xl border border-input bg-background px-3.5 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ink focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-0 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-mist disabled:opacity-60 aria-invalid:border-destructive aria-invalid:outline-destructive',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
