import { AnimalGridSkeleton } from '@/components/animal-card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimalsHeading } from './animals-heading';

/** Shown while the list (filters from the URL, API data) is being fetched. */
export default function Loading() {
  return (
    <div className="page-container py-10 md:py-14">
      <AnimalsHeading />
      <Skeleton className="mt-8 h-44 rounded-3xl lg:h-32" />
      <div className="mt-10">
        <Skeleton className="mb-6 h-6 w-28" />
        <AnimalGridSkeleton />
      </div>
    </div>
  );
}
