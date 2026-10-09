import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { TennisBall } from '@/components/brand';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth';
import { DEMO_MAILBOX_URL } from '@/lib/env';
import { noIndex } from '@/lib/seo';
import { homeFor, safeNextPath } from '@/lib/session-cookie';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Prihlásenie',
  ...noIndex,
};

export default function LoginPage({ searchParams }: PageProps<'/prihlasenie'>) {
  return (
    <section className="page-container py-12 md:py-20">
      <div className="mx-auto max-w-md">
        <TennisBall className="size-12" />
        <h1 className="mt-6 text-4xl sm:text-5xl">Prihlásenie</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Po prihlásení uvidíte stav svojich žiadostí o adopciu. Správcovia
          útulku sa tu dostanú do administrácie.
        </p>
        <Suspense fallback={<Skeleton className="mt-8 h-72 rounded-3xl" />}>
          <LoginGate searchParams={searchParams} />
        </Suspense>
        <p className="mt-6 text-center">
          Nemáte účet?{' '}
          <Link
            href="/registracia"
            className="font-semibold underline underline-offset-4"
          >
            Zaregistrujte sa
          </Link>
        </p>
      </div>
    </section>
  );
}

async function LoginGate({
  searchParams,
}: Pick<PageProps<'/prihlasenie'>, 'searchParams'>) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const next = safeNextPath(first(params.next));

  const session = await getSession();
  if (session.status === 'authenticated') {
    redirect(next ?? homeFor(session.user.role));
  }

  const notices: Record<string, string> = {
    vyprsalo: 'Vaše prihlásenie vypršalo. Prihláste sa znova.',
    overeny: 'Email je overený. Teraz sa môžete prihlásiť.',
  };
  const reason = first(params.dovod);

  return (
    <LoginForm
      next={next ?? ''}
      notice={reason ? notices[reason] : undefined}
      defaultEmail={first(params.email)}
      mailboxUrl={DEMO_MAILBOX_URL}
    />
  );
}
