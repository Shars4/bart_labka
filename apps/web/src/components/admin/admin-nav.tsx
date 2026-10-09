'use client';

import { cn } from 'cn';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { buttonVariants } from '@/components/ui/button';

const TABS = [
  { href: '/admin', label: 'Prehľad', exact: true },
  { href: '/admin/ziadosti', label: 'Žiadosti o adopciu', exact: false },
] as const;

function Tabs({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex gap-1 overflow-x-auto">
      {TABS.map((tab) => {
        const active =
          pathname !== null &&
          (tab.exact ? pathname === tab.href : pathname.startsWith(tab.href));
        return (
          <li key={tab.href}>
            <Link
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex h-11 items-center rounded-full px-4 font-semibold whitespace-nowrap transition-colors hover:bg-mist',
                active && 'bg-ink text-white hover:bg-ink',
              )}
            >
              {tab.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveTabs() {
  return <Tabs pathname={usePathname()} />;
}

export function AdminNav() {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <nav aria-label="Administrácia">
        <Suspense fallback={<Tabs pathname={null} />}>
          <ActiveTabs />
        </Suspense>
      </nav>
      <Link
        href="/admin/zvierata/nove"
        className={buttonVariants({ className: 'self-start sm:self-auto' })}
      >
        <PlusIcon aria-hidden="true" />
        Pridať zviera
      </Link>
    </div>
  );
}
