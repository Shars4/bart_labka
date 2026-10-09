import { cn } from 'cn';
import Link from 'next/link';

/** The logo mark: a tennis ball, drawn in the brand's ink and yellow. */
export function TennisBall({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-8 shrink-0', className)}
    >
      <circle
        cx="16"
        cy="16"
        r="14.5"
        fill="var(--tennis)"
        stroke="var(--ink)"
        strokeWidth="2"
      />
      <path
        d="M5.2 6.6c5.4 4.6 5.4 14.2 0 18.8M26.8 6.6c-5.4 4.6-5.4 14.2 0 18.8"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex min-h-11 items-center gap-2.5 rounded-full font-display text-[1.35rem] font-extrabold tracking-tight',
        className,
      )}
      aria-label="Útulok Labka, úvodná stránka"
    >
      <TennisBall />
      <span>Labka</span>
    </Link>
  );
}
