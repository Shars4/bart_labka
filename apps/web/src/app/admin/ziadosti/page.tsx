import { cn } from 'cn';
import type { Metadata } from 'next';
import Link from 'next/link';
import { AdoptionRequestCard } from '@/components/admin/adoption-request-card';
import { Pagination } from '@/components/pagination';
import { EmptyState, ErrorState } from '@/components/states';
import { redirectIfUnauthorized } from '@/lib/auth';
import { ADMIN_PAGE_SIZE, getAdoptionRequests } from '@/lib/data/admin';

export const metadata: Metadata = { title: 'Žiadosti o adopciu' };

const FILTERS = [
  { value: 'PENDING', label: 'Čakajúce' },
  { value: 'APPROVED', label: 'Schválené' },
  { value: 'REJECTED', label: 'Zamietnuté' },
  { value: 'ALL', label: 'Všetky' },
] as const;
type Filter = (typeof FILTERS)[number]['value'];

const EMPTY_TITLES: Record<Filter, string> = {
  PENDING: 'Žiadne žiadosti nečakajú na vybavenie',
  APPROVED: 'Zatiaľ žiadne schválené žiadosti',
  REJECTED: 'Zatiaľ žiadne zamietnuté žiadosti',
  ALL: 'Zatiaľ neprišla žiadna žiadosť',
};

export default async function AdoptionRequestsPage({
  searchParams,
}: PageProps<'/admin/ziadosti'>) {
  const params = await searchParams;
  const filter: Filter =
    FILTERS.find((option) => option.value === params.stav)?.value ?? 'PENDING';
  const pageParam = Number(params.strana);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const hrefFor = (target: number, stav: Filter = filter) =>
    `/admin/ziadosti?stav=${stav}${target > 1 ? `&strana=${target}` : ''}`;

  const result = await getAdoptionRequests({
    status: filter === 'ALL' ? undefined : filter,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  return (
    <>
      <h1 className="text-4xl md:text-5xl">Žiadosti o adopciu</h1>
      <nav aria-label="Filter žiadostí" className="mt-6">
        <ul className="flex flex-wrap gap-2">
          {FILTERS.map((option) => (
            <li key={option.value}>
              <Link
                href={hrefFor(1, option.value)}
                aria-current={option.value === filter ? 'page' : undefined}
                className={cn(
                  'inline-flex h-11 items-center rounded-full border border-ink/25 px-4 font-semibold hover:bg-mist',
                  option.value === filter &&
                    'border-ink bg-ink text-white hover:bg-ink',
                )}
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        {!result.ok ? (
          <ErrorState
            error={redirectIfUnauthorized(result.error, hrefFor(page))}
            title="Žiadosti sa nepodarilo načítať"
          />
        ) : result.data.data.length === 0 ? (
          <EmptyState title={EMPTY_TITLES[filter]}>
            Nové žiadosti posielajú návštevníci zo stránky zvieraťa.
          </EmptyState>
        ) : (
          <>
            <h2 className="sr-only">Zoznam žiadostí</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.data.data.map((request) => (
                <AdoptionRequestCard key={request.id} request={request} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={result.data.meta.totalPages}
              hrefFor={(target) => hrefFor(target)}
            />
          </>
        )}
      </div>
    </>
  );
}
