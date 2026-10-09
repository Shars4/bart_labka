import { Skeleton } from '@/components/ui/skeleton';

export function AnimalCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] rounded-2xl sm:rounded-[1.75rem]" />
      {/* As tall as the summary under a card: two lines of text-sm on phones,
          where narrow cards usually wrap it, one line of text-base from sm. */}
      <div className="mt-2 flex h-10 flex-col justify-center gap-2 sm:mt-3 sm:h-6">
        <Skeleton className="h-3.5 w-4/5 sm:h-4 sm:w-2/3" />
        <Skeleton className="h-3.5 w-1/2 sm:hidden" />
      </div>
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
