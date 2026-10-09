import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminAnimalList } from '@/components/admin/admin-animal-list';
import { FlashToast } from '@/components/admin/flash-toast';
import { StatsPanel } from '@/components/admin/stats-panel';
import { Pagination } from '@/components/pagination';
import { EmptyState, ErrorState } from '@/components/states';
import { buttonVariants } from '@/components/ui/button';
import { redirectIfUnauthorized } from '@/lib/auth';
import { getAdminAnimals, getStats } from '@/lib/data/admin';
import { noticeFromParams } from '@/lib/notices';

export const metadata: Metadata = { title: 'Prehľad' };

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<'/admin'>) {
  const params = await searchParams;
  const pageParam = Number(params.strana);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const [stats, animals] = await Promise.all([
    getStats(),
    getAdminAnimals(page),
  ]);

  return (
    <>
      <FlashToast message={noticeFromParams(params)} />
      <h1 className="sr-only">Prehľad administrácie</h1>

      {stats.ok ? (
        <StatsPanel stats={stats.data} />
      ) : (
        <ErrorState
          error={redirectIfUnauthorized(stats.error, '/admin')}
          title="Prehľad sa nepodarilo načítať"
        />
      )}

      <section aria-labelledby="animals-heading" className="mt-12">
        <h2 id="animals-heading" className="text-3xl">
          Všetky zvieratá
        </h2>
        <div className="mt-4">
          {!animals.ok ? (
            <ErrorState
              error={redirectIfUnauthorized(animals.error, '/admin')}
              title="Zvieratá sa nepodarilo načítať"
            />
          ) : animals.data.data.length === 0 ? (
            <EmptyState
              title="Zatiaľ tu nie sú žiadne zvieratá"
              action={
                <Link href="/admin/zvierata/nove" className={buttonVariants()}>
                  Pridať prvé zviera
                </Link>
              }
            >
              Pridané zvieratá sa hneď zobrazia na verejnej stránke.
            </EmptyState>
          ) : (
            <>
              <AdminAnimalList animals={animals.data.data} />
              <Pagination
                page={page}
                totalPages={animals.data.meta.totalPages}
                hrefFor={(target) => `/admin?strana=${target}`}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
