import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { TennisBall } from '@/components/brand';
import { Skeleton } from '@/components/ui/skeleton';
import { getSession } from '@/lib/auth';
import { noIndex } from '@/lib/seo';
import { safeAdminPath } from '@/lib/session-cookie';
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
        <h1 className="mt-6 text-4xl sm:text-5xl">Prihlásenie pre správcov</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Po prihlásení môžete pridávať a upravovať zvieratá a vybavovať
          žiadosti o adopciu.
        </p>
        <Suspense fallback={<Skeleton className="mt-8 h-72 rounded-3xl" />}>
          <LoginGate searchParams={searchParams} />
        </Suspense>
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
  const next = safeAdminPath(first(params.next));

  const session = await getSession();
  if (session.status === 'authenticated') {
    redirect(next);
  }

  return (
    <LoginForm
      next={next}
      notice={
        first(params.dovod) === 'vyprsalo'
          ? 'Vaše prihlásenie vypršalo. Prihláste sa znova.'
          : undefined
      }
    />
  );
}
