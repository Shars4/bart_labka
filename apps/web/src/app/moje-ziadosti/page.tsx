import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AnimalPhoto } from '@/components/animal-photo';
import { Pagination } from '@/components/pagination';
import {
  type RequestStatus,
  RequestStatusBadge,
} from '@/components/request-status-badge';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { animalPath } from '@/lib/animals';
import { redirectIfUnauthorized } from '@/lib/auth';
import { getMyAdoptionRequests } from '@/lib/data/my-requests';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Moje žiadosti',
  ...noIndex,
};

const NEXT_STEP: Record<RequestStatus, string> = {
  PENDING: 'Útulok žiadosť posudzuje a ozve sa vám.',
  APPROVED: 'Ozveme sa vám a dohodneme, kedy si môžete prísť po zviera.',
  REJECTED: 'Tentoraz sme sa rozhodli pre iného záujemcu.',
};

const sentAt = new Intl.DateTimeFormat('sk-SK', {
  dateStyle: 'long',
  timeZone: 'Europe/Bratislava',
});

export default function MyRequestsPage({
  searchParams,
}: PageProps<'/moje-ziadosti'>) {
  return (
    <section className="page-container py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl">Moje žiadosti</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Žiadosti o adopciu, ktoré ste poslali, a ako sú vybavené. O každom
        rozhodnutí vám pošleme aj email.
      </p>
      <Suspense fallback={<RequestsSkeleton />}>
        <Requests searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Requests({
  searchParams,
}: Pick<PageProps<'/moje-ziadosti'>, 'searchParams'>) {
  const { strana } = await searchParams;
  const pageParam = Number(strana);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const hrefFor = (target: number) =>
    target > 1 ? `/moje-ziadosti?strana=${target}` : '/moje-ziadosti';

  const result = await getMyAdoptionRequests(page);
  if (!result.ok) {
    return (
      <ErrorState
        error={redirectIfUnauthorized(result.error, hrefFor(page))}
        title="Žiadosti sa nepodarilo načítať"
        className="mt-8"
      />
    );
  }

  const { data: requests, meta } = result.data;
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Zatiaľ ste neposlali žiadnu žiadosť"
        className="mt-8"
        action={
          <Link href="/zvierata" className={buttonVariants()}>
            Pozrieť zvieratá
          </Link>
        }
      >
        Žiadosť o adopciu pošlete zo stránky zvieraťa, ktoré vás zaujme.
      </EmptyState>
    );
  }

  return (
    <>
      <h2 className="sr-only">Zoznam žiadostí</h2>
      <ul className="mt-8 grid gap-4 lg:grid-cols-2">
        {requests.map((request) => (
          <li
            key={request.id}
            className="flex gap-4 rounded-3xl border border-border p-4 sm:p-6"
          >
            <AnimalPhoto
              src={request.animal.imageUrl}
              alt=""
              sizes="6rem"
              className="size-20 shrink-0 rounded-2xl sm:size-24"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-2xl">
                  <Link
                    href={animalPath(request.animal)}
                    className="hover:underline"
                  >
                    {request.animal.name}
                  </Link>
                </h3>
                <RequestStatusBadge status={request.status} />
              </div>
              <p className="mt-2">{NEXT_STEP[request.status]}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Odoslaná{' '}
                <time dateTime={request.createdAt}>
                  {sentAt.format(new Date(request.createdAt))}
                </time>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <Pagination page={page} totalPages={meta.totalPages} hrefFor={hrefFor} />
    </>
  );
}

function RequestsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Načítavam žiadosti"
      className="mt-8 grid gap-4 lg:grid-cols-2"
    >
      {Array.from({ length: 2 }, (_, index) => (
        <Skeleton key={index} className="h-32 rounded-3xl sm:h-36" />
      ))}
    </div>
  );
}
