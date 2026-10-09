import type { Metadata } from 'next';
import Link from 'next/link';
import { AnimalCard, AnimalGrid } from '@/components/animal-card';
import { AnimalFilters } from '@/components/animal-filters';
import { Pagination } from '@/components/pagination';
import { RememberListUrl } from '@/components/remember-list-url';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import {
  type AnimalFilters as Filters,
  PAGE_SIZE,
  filtersToQuery,
  hasActiveFilters,
  parseFilters,
} from '@/lib/animal-filters';
import { plural } from '@/lib/animals';
import { getAnimals } from '@/lib/data/animals';
import { pageMetadata } from '@/lib/seo';
import { AnimalsHeading } from './animals-heading';

export const metadata: Metadata = pageMetadata({
  title: 'Zvieratá na adopciu',
  description:
    'Psy, mačky, králiky a ďalšie zvieratá z Útulku Labka, ktoré hľadajú nový domov. Vyberte si podľa druhu, veľkosti alebo pohlavia.',
  path: '/zvierata',
});

export default async function AnimalsPage({
  searchParams,
}: PageProps<'/zvierata'>) {
  const filters = parseFilters(await searchParams);

  return (
    <div className="page-container py-10 md:py-14">
      <AnimalsHeading />
      <div className="mt-8">
        <AnimalFilters filters={filters} />
      </div>
      <RememberListUrl query={filtersToQuery(filters)} />
      <div className="mt-10">
        <AnimalResults filters={filters} />
      </div>
    </div>
  );
}

async function AnimalResults({ filters }: { filters: Filters }) {
  const result = await getAnimals({
    species: filters.species,
    sex: filters.sex,
    size: filters.size,
    status: filters.status,
    q: filters.q,
    sort: filters.sort,
    page: filters.page,
    pageSize: PAGE_SIZE,
  });

  if (!result.ok) {
    return (
      <ErrorState error={result.error} title="Zvieratá sa nepodarilo načítať" />
    );
  }

  const { data: animals, meta } = result.data;

  if (animals.length === 0) {
    return meta.total > 0 ? (
      <EmptyState
        title="Táto stránka je prázdna"
        action={
          <Link
            href={`/zvierata${filtersToQuery({ ...filters, page: 1 })}`}
            className={buttonVariants()}
          >
            Prejsť na prvú stránku
          </Link>
        }
      >
        Zoznam má iba {meta.totalPages}{' '}
        {plural(meta.totalPages, ['stránku', 'stránky', 'stránok'])}.
      </EmptyState>
    ) : (
      <EmptyState
        title="Takéto zviera v útulku momentálne nemáme"
        action={
          hasActiveFilters(filters) ? (
            <Link href="/zvierata" className={buttonVariants()}>
              Zrušiť filtre
            </Link>
          ) : undefined
        }
      >
        {hasActiveFilters(filters)
          ? 'Skúste zmeniť alebo zrušiť niektorý z filtrov.'
          : 'Všetky zvieratá už našli domov. Pozrite sa sem znova o pár dní.'}
      </EmptyState>
    );
  }

  return (
    <section aria-labelledby="vysledky">
      <h2 id="vysledky" className="sr-only">
        Výsledky
      </h2>
      <p className="mb-6 font-semibold" aria-live="polite">
        {meta.total} {plural(meta.total, ['zviera', 'zvieratá', 'zvierat'])}
      </p>
      <AnimalGrid>
        {animals.map((animal, index) => (
          <AnimalCard key={animal.id} animal={animal} priority={index < 2} />
        ))}
      </AnimalGrid>
      <Pagination
        page={filters.page}
        totalPages={meta.totalPages}
        hrefFor={(page) => `/zvierata${filtersToQuery({ ...filters, page })}`}
      />
    </section>
  );
}
