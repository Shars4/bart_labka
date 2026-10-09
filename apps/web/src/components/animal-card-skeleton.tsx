import { Skeleton } from '@/components/ui/skeleton';

export function AnimalCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] rounded-2xl sm:rounded-[1.75rem]" />
      <Skeleton className="mt-3 h-5 w-2/3" />
    </div>
  );
}

export function AnimalGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Načítavam zvieratá"
      className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: count }, (_, index) => (
        <AnimalCardSkeleton key={index} />
      ))}
    </div>
  );
}
