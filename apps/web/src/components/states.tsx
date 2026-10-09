import { cn } from 'cn';
import type { ReactNode } from 'react';
import { TennisBall } from '@/components/brand';
import type { ApiError } from '@/lib/api/errors';
import { RetryButton } from './retry-button';

interface StateProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Shown when a list has nothing to show; always offers the next step. */
export function EmptyState({ title, children, action, className }: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-3xl bg-mist px-6 py-14 text-center',
        className,
      )}
    >
      <TennisBall className="size-12 opacity-80" />
      <h2 className="mt-5 text-2xl">{title}</h2>
      {children ? (
        <div className="mt-2 max-w-md text-muted-foreground">{children}</div>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/** Shows an API error in plain language, with a way to retry. */
export function ErrorState({
  error,
  title = 'Údaje sa nepodarilo načítať',
  className,
}: {
  error: ApiError;
  title?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-4 rounded-3xl border-2 border-destructive/30 bg-[#fff5f5] px-6 py-8 sm:px-8',
        className,
      )}
    >
      <div>
        <h2 className="text-2xl">{title}</h2>
        <p className="mt-2 max-w-prose text-foreground">{error.message}</p>
      </div>
      <RetryButton />
    </div>
  );
}
