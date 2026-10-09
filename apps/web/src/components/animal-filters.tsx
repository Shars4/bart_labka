'use client';

import { Loader2Icon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useTransition } from 'react';
import { NativeSelect } from '@/components/native-select';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type AnimalFilters as Filters,
  filtersToQuery,
  hasActiveFilters,
} from '@/lib/animal-filters';
import {
  SEX_LABELS,
  SIZE_LABELS,
  SORT_LABELS,
  SPECIES_PLURAL_LABELS,
  STATUS_LABELS,
} from '@/lib/animals';

// The label above each select names the filter, so "Všetky" is enough.
const SELECTS = [
  {
    name: 'species',
    label: 'Druh',
    all: 'Všetky',
    options: SPECIES_PLURAL_LABELS,
  },
  { name: 'size', label: 'Veľkosť', all: 'Všetky', options: SIZE_LABELS },
  { name: 'sex', label: 'Pohlavie', all: 'Obe', options: SEX_LABELS },
  { name: 'status', label: 'Stav', all: 'Všetky', options: STATUS_LABELS },
] as const;

/**
 * A plain GET form, so filtering works without JavaScript. With JavaScript,
 * selects apply immediately and the list updates without a full reload.
 */
export function AnimalFilters({ filters }: { filters: Filters }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function apply(form: HTMLFormElement) {
    const data = new FormData(form);
    const query = filtersToQuery({
      q: String(data.get('q') ?? '').trim() || undefined,
      species: (data.get('species') || undefined) as Filters['species'],
      size: (data.get('size') || undefined) as Filters['size'],
      sex: (data.get('sex') || undefined) as Filters['sex'],
      status: (data.get('status') || undefined) as Filters['status'],
      sort: (data.get('sort') || undefined) as Filters['sort'],
      // Any change of filters starts again at the first page.
      page: 1,
    });
    startTransition(() => router.push(`/zvierata${query}`, { scroll: false }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    apply(event.currentTarget);
  }

  return (
    <form
      // Remount when the URL changes elsewhere (e.g. "Zrušiť filtre"), so the
      // uncontrolled fields show the current values.
      key={filtersToQuery(filters)}
      role="search"
      aria-label="Filtrovanie zvierat"
      action="/zvierata"
      method="get"
      onSubmit={onSubmit}
      className="rounded-3xl bg-sky p-4 sm:p-6"
    >
      {/* Search and sort on the first row, filters below: 2×2 on phones. */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-3">
          <Label htmlFor="filter-q">Meno alebo plemeno</Label>
          <div className="mt-1.5 flex gap-2">
            <Input
              id="filter-q"
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="napr. Bella, kríženec"
              maxLength={100}
              enterKeyHint="search"
            />
            <Button type="submit" size="icon" aria-label="Hľadať">
              <SearchIcon />
            </Button>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <Label htmlFor="filter-sort">Zoradiť</Label>
          <NativeSelect
            id="filter-sort"
            name="sort"
            defaultValue={filters.sort}
            onChange={(event) => apply(event.currentTarget.form!)}
            className="mt-1.5"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>

        {SELECTS.map((select) => (
          <div key={select.name}>
            <Label htmlFor={`filter-${select.name}`}>{select.label}</Label>
            <NativeSelect
              id={`filter-${select.name}`}
              name={select.name}
              defaultValue={filters[select.name] ?? ''}
              onChange={(event) => apply(event.currentTarget.form!)}
              className="mt-1.5"
            >
              <option value="">{select.all}</option>
              {Object.entries(select.options).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </NativeSelect>
          </div>
        ))}
      </div>

      {/* Takes space only while loading or when filters can be cleared. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 has-[>:not(:empty)]:mt-4">
        <p
          aria-live="polite"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          {pending ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
              Načítavam výsledky…
            </>
          ) : null}
        </p>
        {hasActiveFilters(filters) ? (
          <Link
            href="/zvierata"
            scroll={false}
            className={buttonVariants({
              variant: 'link',
              className: 'text-sm',
            })}
          >
            Zrušiť filtre
          </Link>
        ) : null}
      </div>
    </form>
  );
}
