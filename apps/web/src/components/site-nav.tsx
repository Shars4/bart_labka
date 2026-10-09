'use client';

import { cn } from 'cn';
import { MenuIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState } from 'react';
import { BrandLink } from '@/components/brand';
import { SectionLink } from '@/components/section-link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export const NAV_ITEMS = [
  { href: '/zvierata', label: 'Zvieratá na adopciu' },
  { href: '/#ako-adoptovat', label: 'Ako adoptovať' },
] as const;

function isSectionHref(href: string): href is `${string}#${string}` {
  return href.includes('#');
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname || isSectionHref(href)) {
    return false;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface NavItemsProps {
  /** null while the current path is not known yet (prerendered shell). */
  pathname: string | null;
  layout: 'desktop' | 'mobile';
  onNavigate?: () => void;
}

function NavItems({ pathname, layout, onNavigate }: NavItemsProps) {
  return (
    <ul
      className={
        layout === 'desktop' ? 'flex items-center gap-1' : 'flex flex-col'
      }
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        const linkProps = {
          onClick: onNavigate,
          'aria-current': active ? ('page' as const) : undefined,
          className:
            layout === 'desktop'
              ? cn(
                  'relative inline-flex h-11 items-center rounded-full px-4 font-semibold transition-colors hover:bg-mist',
                  active &&
                    'after:absolute after:inset-x-4 after:bottom-1.5 after:h-1 after:rounded-full after:bg-tennis',
                )
              : 'flex h-12 items-center rounded-xl px-3 text-lg font-semibold hover:bg-mist aria-[current=page]:bg-sky',
          children: item.label,
        };
        return (
          <li key={item.href}>
            {isSectionHref(item.href) ? (
              <SectionLink href={item.href} {...linkProps} />
            ) : (
              <Link href={item.href} {...linkProps} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Knows the current path, so it can mark the active item. */
function ActiveNavItems(props: Omit<NavItemsProps, 'pathname'>) {
  return <NavItems pathname={usePathname()} {...props} />;
}

/**
 * The current path is request data on dynamic routes, so the active state
 * streams in behind Suspense; the prerendered shell shows plain links.
 */
function CurrentNavItems(props: Omit<NavItemsProps, 'pathname'>) {
  return (
    <Suspense fallback={<NavItems pathname={null} {...props} />}>
      <ActiveNavItems {...props} />
    </Suspense>
  );
}

export function DesktopNav() {
  return (
    <nav aria-label="Hlavná navigácia" className="hidden md:block">
      <CurrentNavItems layout="desktop" />
    </nav>
  );
}

/** Off-canvas menu for small screens. */
export function MobileNav({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Otvoriť menu"
          />
        }
      >
        <MenuIcon className="size-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)] p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle render={<div />}>
            <BrandLink />
          </SheetTitle>
          <SheetDescription className="sr-only">Hlavné menu</SheetDescription>
        </SheetHeader>
        <nav aria-label="Hlavná navigácia" className="px-2">
          <CurrentNavItems layout="mobile" onNavigate={close} />
        </nav>
        {children ? (
          <div className="mt-auto border-t border-border p-4" onClick={close}>
            {children}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
