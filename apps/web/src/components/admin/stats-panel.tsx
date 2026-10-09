import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import type { components } from '@/lib/api/schema';
import { plural } from '@/lib/animals';

type Stats = components['schemas']['StatsDto'];

function Stat({ value, label }: { value: number; label: string }) {
  return (
    // dt must come first in the markup; flex-col-reverse puts the number on top.
    <div className="flex flex-col-reverse rounded-2xl bg-mist px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="font-display text-4xl font-extrabold">{value}</dd>
    </div>
  );
}

/** Counts by status; pending requests stand out because they need action. */
export function StatsPanel({ stats }: { stats: Stats }) {
  const { animals, adoptionRequests: requests } = stats;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section aria-labelledby="stats-animals">
        <h2 id="stats-animals" className="text-2xl">
          Zvieratá
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={animals.total} label="spolu" />
          <Stat value={animals.available} label="hľadá domov" />
          <Stat value={animals.reserved} label="rezervované" />
          <Stat value={animals.adopted} label="adoptované" />
        </dl>
      </section>

      <section aria-labelledby="stats-requests">
        <h2 id="stats-requests" className="text-2xl">
          Žiadosti o adopciu
        </h2>
        <Link
          href="/admin/ziadosti"
          className="mt-3 flex items-center justify-between gap-4 rounded-2xl bg-tennis px-4 py-3 hover:bg-tennis-strong"
        >
          <span>
            <span className="block font-display text-4xl font-extrabold">
              {requests.pending}
            </span>
            <span className="text-sm font-semibold">
              {plural(requests.pending, ['čaká', 'čakajú', 'čaká'])} na
              vybavenie
            </span>
          </span>
          <ArrowRightIcon aria-hidden="true" className="size-6" />
        </Link>
        <p className="mt-2 text-sm text-muted-foreground">
          Vybavené: {requests.approved} schválené, {requests.rejected}{' '}
          zamietnuté
        </p>
      </section>
    </div>
  );
}
