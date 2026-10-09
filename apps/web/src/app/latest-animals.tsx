import Link from 'next/link';
import { AnimalCard, AnimalGrid } from '@/components/animal-card';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
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
