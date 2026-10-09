'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RetryButton } from '@/components/retry-button';
import { buttonVariants } from '@/components/ui/button';

/**
 * Unexpected errors only. Expected API errors (validation, not found, API
 * unavailable) are handled on the page itself, because in production Next.js
 * hides the message of server errors from this boundary.
 */
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="page-container py-20">
      <div className="max-w-xl">
        <h1 className="text-4xl sm:text-5xl">Stránku sa nepodarilo zobraziť</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Na serveri nastala neočakávaná chyba. Skúste stránku načítať znova,
          prípadne sa vráťte na zoznam zvierat.
        </p>
        {error.digest ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Kód chyby: {error.digest}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <RetryButton onRetry={retry} />
          <Link
            href="/zvierata"
            className={buttonVariants({ variant: 'ghost' })}
          >
            Zvieratá na adopciu
          </Link>
        </div>
      </div>
    </section>
  );
}
