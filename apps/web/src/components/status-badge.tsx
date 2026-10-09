import { cn } from 'cn';
import { type AnimalStatus, STATUS_LABELS } from '@/lib/animals';

const STYLES: Record<AnimalStatus, string> = {
  AVAILABLE: 'bg-tennis text-ink',
  RESERVED: 'bg-sky text-ink',
  ADOPTED: 'bg-ink text-white',
};

export function StatusBadge({
  status,
  className,
}: {
  status: AnimalStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-sm font-semibold',
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
