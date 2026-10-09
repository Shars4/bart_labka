import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-label="Načítavam žiadosti">
      <Skeleton className="h-12 w-80 max-w-full" />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-11 w-28 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
