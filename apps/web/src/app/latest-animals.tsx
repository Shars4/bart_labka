import Link from 'next/link';
import { AnimalCard, AnimalGrid } from '@/components/animal-card';
import { AnimalGridSkeleton } from '@/components/animal-card-skeleton';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { plural } from '@/lib/animals';
import { getAnimals } from '@/lib/data/animals';

/** The four most recently admitted animals that are still looking for a home. */
export async function LatestAnimals() {
  const result = await getAnimals({
    status: 'AVAILABLE',
    sort: 'newest',
    pageSize: 4,
  });

  if (!result.ok) {
    return (
      <ErrorState error={result.error} title="Zvieratá sa nepodarilo načítať" />
    );
  }
  if (result.data.data.length === 0) {
    return (
      <EmptyState title="Všetky zvieratá našli domov">
        Momentálne nikto nečaká. Pozrite sa sem znova o pár dní.
      </EmptyState>
    );
  }

  return (
    <>
      <AnimalGrid>
        {result.data.data.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </AnimalGrid>
      <Link
        href="/zvierata"
        className={buttonVariants({
          variant: 'outline',
          size: 'lg',
          className: 'mt-10',
        })}
      >
        Všetky zvieratá ({result.data.meta.total}{' '}
        {plural(result.data.meta.total, ['hľadá', 'hľadajú', 'hľadá'])} domov)
      </Link>
    </>
  );
}

/**
 * As tall as LatestAnimals, so the page below does not move when the data
 * streams in (e.g. after a jump to #ako-adoptovat from another page).
 */
export function LatestAnimalsSkeleton() {
  return (
    <>
      <AnimalGridSkeleton count={4} />
      <Skeleton className="mt-10 h-12 w-72 rounded-full" />
    </>
  );
}
