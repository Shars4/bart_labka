import type { Metadata } from 'next';
import Link from 'next/link';
import { TennisBall } from '@/components/brand';
import { buttonVariants } from '@/components/ui/button';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Stránka nenájdená',
  ...noIndex,
};

export default function NotFound() {
  return (
    <section className="page-container py-20">
      <TennisBall className="size-16" />
      <h1 className="mt-6 max-w-2xl text-4xl sm:text-5xl">
        Túto stránku sme nenašli
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        Odkaz môže byť neplatný, alebo zviera už v útulku nie je.
      </p>
      <Link
        href="/zvierata"
        className={buttonVariants({ size: 'lg', className: 'mt-8' })}
      >
        Pozrieť zvieratá na adopciu
      </Link>
    </section>
  );
}
