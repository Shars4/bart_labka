'use client';

import { ArrowLeftIcon } from 'lucide-react';
import Link from 'next/link';
import { useSyncExternalStore } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { readRememberedListQuery } from '@/components/remember-list-url';

const noSubscription = () => () => {};

/** Back to the animal list with the filters the visitor last used. */
export function BackLink() {
  const query = useSyncExternalStore(
    noSubscription,
    readRememberedListQuery,
    () => '',
  );

  return (
    <Link
      href={`/zvierata${query}`}
      className={buttonVariants({ variant: 'ghost', className: '-ml-3' })}
    >
      <ArrowLeftIcon />
      Späť na zoznam
    </Link>
  );
}
