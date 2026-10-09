import { cn } from 'cn';
import type { components } from '@/lib/api/schema';

export type RequestStatus = components['schemas']['AdoptionStatus'];

const LABELS: Record<RequestStatus, string> = {
  PENDING: 'Čaká na vybavenie',
  APPROVED: 'Schválená',
  REJECTED: 'Zamietnutá',
};

const STYLES: Record<RequestStatus, string> = {
  PENDING: 'bg-tennis text-ink',
  APPROVED: 'bg-ink text-white',
  REJECTED: 'bg-mist text-ink',
};

/** Status of an adoption request, the same in the admin area and for users. */
export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full px-3 text-sm font-semibold',
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
