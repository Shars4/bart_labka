'use client';

import { Loader2Icon } from 'lucide-react';
import { useLinkStatus } from 'next/link';

/**
 * Feedback inside a Link while its page loads. Used for the animal detail,
 * which renders on the server before responding (no loading.tsx), so its
 * 404 and redirects keep real HTTP status codes. Appears after a short
 * delay, so fast navigations do not flash.
 */
export function LinkPendingOverlay() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden={!pending}
      className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-white/45 transition-opacity ${
        pending ? 'opacity-100 delay-150' : 'opacity-0'
      }`}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-tennis">
        <Loader2Icon className="size-7 animate-spin text-ink" />
      </span>
      {pending ? <span className="sr-only">Načítavam…</span> : null}
    </span>
  );
}
