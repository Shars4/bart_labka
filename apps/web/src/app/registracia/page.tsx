import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { TennisBall } from '@/components/brand';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth';
import { DEMO_MAILBOX_URL } from '@/lib/env';
import { noIndex } from '@/lib/seo';
import { homeFor } from '@/lib/session-cookie';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Registrácia',
  ...noIndex,
};

export default function RegisterPage() {
  return (
    <section className="page-container py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <TennisBall className="size-12" />
        <h1 className="mt-6 text-4xl sm:text-5xl">Registrácia</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          S účtom máte formulár žiadosti o adopciu predvyplnený a na jednom
          mieste vidíte, ako sú vaše žiadosti vybavené.
        </p>
        <Suspense fallback={<Skeleton className="mt-8 h-96 rounded-3xl" />}>
          <RegisterGate />
        </Suspense>
        <p className="mt-6 text-center">
          Už máte účet?{' '}
          <Link
            href="/prihlasenie"
            className="font-semibold underline underline-offset-4"
          >
            Prihláste sa
          </Link>
        </p>
      </div>
    </section>
  );
}

/** Signed-in visitors have nothing to do here. */
async function RegisterGate() {
  const session = await getSession();
  if (session.status === 'authenticated') {
    redirect(homeFor(session.user.role));
  }
  return <RegisterForm mailboxUrl={DEMO_MAILBOX_URL} />;
}
