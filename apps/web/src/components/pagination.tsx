import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

/** Previous/next links; `hrefFor` keeps the page's other query parameters. */
export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Stránkovanie"
      className="mt-12 flex items-center justify-between gap-4"
    >
      {page > 1 ? (
        <Link
          href={hrefFor(page - 1)}
          className={buttonVariants({ variant: 'outline' })}
        >
          <ChevronLeftIcon />
          Predchádzajúca
        </Link>
      ) : (
        <span />
      )}
      <p className="text-center font-semibold">
        Strana {page} z {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={hrefFor(page + 1)}
          className={buttonVariants({ variant: 'outline' })}
        >
          Ďalšia
          <ChevronRightIcon />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
