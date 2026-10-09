import { CircleAlertIcon, CircleCheckIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { DemoMailboxNotice } from '@/components/demo-mailbox-notice';
import { ResendVerification } from '@/components/resend-verification';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { callApi } from '@/lib/api/client';
import { DEMO_MAILBOX_URL } from '@/lib/env';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Overenie emailu',
  ...noIndex,
};

export default function VerifyEmailPage({
  searchParams,
}: PageProps<'/overenie-emailu'>) {
  return (
    <section className="page-container py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-4xl sm:text-5xl">Overenie emailu</h1>
        <Suspense
          fallback={
            <div role="status" aria-label="Overujem email">
              <Skeleton className="mt-8 h-48 rounded-3xl" />
            </div>
          }
        >
          <Verification searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

/**
 * Verifies on page load. The API's verification is idempotent, so opening
 * the link twice, or an email scanner opening it first, does no harm.
 */
async function Verification({
  searchParams,
}: Pick<PageProps<'/overenie-emailu'>, 'searchParams'>) {
  const { token } = await searchParams;
  const result =
    typeof token === 'string' && token !== ''
      ? await callApi((api) =>
          api.POST('/api/auth/verify-email', { body: { token } }),
        )
      : null;

  if (result?.ok) {
    return (
      <div role="status" className="mt-8 rounded-3xl bg-sky p-5 sm:p-8">
        <CircleCheckIcon aria-hidden="true" className="size-10" />
        <p className="mt-4 text-2xl font-display font-bold">
          Hotovo, email {result.data.email} je overený.
        </p>
        <p className="mt-2">Teraz sa môžete prihlásiť.</p>
        <Link
          href="/prihlasenie?dovod=overeny"
          className={buttonVariants({ size: 'lg', className: 'mt-6' })}
        >
          Prihlásiť sa
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-border p-5 sm:p-8">
      <CircleAlertIcon
        aria-hidden="true"
        className="size-10 text-destructive"
      />
      <p role="alert" className="mt-4 text-lg font-semibold">
        {result
          ? result.error.message
          : 'V odkaze chýba overovací kód. Otvorte celý odkaz z emailu.'}
      </p>
      <p className="mt-4 mb-4">
        Zadajte email, s ktorým ste sa registrovali, a pošleme vám nový odkaz.
      </p>
      <ResendVerification />
      <div className="mt-5">
        <DemoMailboxNotice url={DEMO_MAILBOX_URL} />
      </div>
    </div>
  );
}
