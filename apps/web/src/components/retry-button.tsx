'use client';

import { RotateCwIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

/** Re-renders the current page on the server, fetching the data again. */
export function RetryButton({ onRetry }: { onRetry?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      aria-busy={pending}
      disabled={pending}
      onClick={() =>
        startTransition(() => (onRetry ? onRetry() : router.refresh()))
      }
    >
      <RotateCwIcon className={pending ? 'animate-spin' : undefined} />
      {pending ? 'Načítavam…' : 'Skúsiť znova'}
    </Button>
  );
}
