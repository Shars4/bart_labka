import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-label="Načítavam prehľad">
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <Skeleton className="h-8 w-32" />
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-3 h-20 rounded-2xl" />
        </div>
      </div>
      <Skeleton className="mt-12 h-9 w-56" />
      <div className="mt-4 grid gap-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
