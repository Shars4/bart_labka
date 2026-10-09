import Link from 'next/link';
import { AnimalPhoto } from '@/components/animal-photo';
import { LinkPendingOverlay } from '@/components/link-pending-overlay';
import { StatusBadge } from '@/components/status-badge';
import { type Animal, animalPath, animalSummaryLine } from '@/lib/animals';

/**
 * The photo carries the card: the name sits on the photo, the details in
 * one line below. Only animals that are not available get a status badge.
 */
export function AnimalCard({
  animal,
  priority,
}: {
  animal: Animal;
  priority?: boolean;
}) {
  return (
    <article className="group">
      <Link
        href={animalPath(animal)}
        className="block rounded-2xl sm:rounded-[1.75rem] focus-visible:outline-offset-4"
      >
        <div className="relative rounded-2xl sm:rounded-[1.75rem]">
          <AnimalPhoto
            src={animal.imageUrl}
            alt={animal.name}
            priority={priority}
            sizes="(min-width: 1280px) 18rem, (min-width: 1024px) 30vw, 50vw"
            className="aspect-[4/5] rounded-2xl sm:rounded-[1.75rem]"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-2xl sm:rounded-b-[1.75rem] bg-linear-to-t from-ink/85 via-ink/40 to-transparent px-3 pt-12 pb-3 sm:px-5 sm:pt-16 sm:pb-4">
            <h3 className="text-xl text-white sm:text-3xl [font-stretch:90%] group-hover:underline group-hover:decoration-tennis group-hover:decoration-4 group-hover:underline-offset-4">
              {animal.name}
            </h3>
          </div>
          <LinkPendingOverlay />
          {animal.status !== 'AVAILABLE' ? (
            <StatusBadge
              status={animal.status}
              className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4"
            />
          ) : null}
        </div>
        <p className="mt-2 px-1 text-sm text-muted-foreground sm:mt-3 sm:text-base">
          {animalSummaryLine(animal)}
        </p>
      </Link>
    </article>
  );
}

export function AnimalGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
