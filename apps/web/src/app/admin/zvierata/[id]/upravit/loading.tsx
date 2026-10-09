import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div role="status" aria-label="Načítavam zviera" className="max-w-3xl">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="mt-3 mb-8 h-6 w-1/2" />
      <div className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-6 h-40 rounded-xl" />
    </div>
  );
}
