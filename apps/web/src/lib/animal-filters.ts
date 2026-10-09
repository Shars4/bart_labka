import {
  type AnimalSort,
  type AnimalStatus,
  SEX_LABELS,
  SIZE_LABELS,
  SORT_LABELS,
  SPECIES_LABELS,
  STATUS_LABELS,
  type Sex,
  type Size,
  type Species,
} from '@/lib/animals';

/**
 * Filters of the animal list. They live in the URL (?species=DOG&page=2), so
 * they survive back/forward navigation and reloads, and can be shared.
 */
export interface AnimalFilters {
  species?: Species;
  sex?: Sex;
  size?: Size;
  status?: AnimalStatus;
  q?: string;
  sort: AnimalSort;
  page: number;
}

export const PAGE_SIZE = 12;
export const DEFAULT_SORT: AnimalSort = 'newest';

type SearchParams = Record<string, string | string[] | undefined>;

function pick<T extends string>(
  value: string | string[] | undefined,
  allowed: Record<T, string>,
): T | undefined {
  const single = Array.isArray(value) ? value[0] : value;
  return single && single in allowed ? (single as T) : undefined;
}

/**
 * Reads filters from the query string. Unknown values are ignored rather
 * than sent to the API, so a mistyped URL still shows a list.
 */
export function parseFilters(params: SearchParams): AnimalFilters {
  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim();
  const page = Number(
    Array.isArray(params.page) ? params.page[0] : params.page,
  );
  return {
    species: pick(params.species, SPECIES_LABELS),
    sex: pick(params.sex, SEX_LABELS),
    size: pick(params.size, SIZE_LABELS),
    status: pick(params.status, STATUS_LABELS),
    q: q ? q.slice(0, 100) : undefined,
    sort: pick(params.sort, SORT_LABELS) ?? DEFAULT_SORT,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/** Query string for the given filters, leaving out default values. */
export function filtersToQuery(filters: Partial<AnimalFilters>): string {
  const params = new URLSearchParams();
  for (const key of ['q', 'species', 'size', 'sex', 'status'] as const) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  if (filters.sort && filters.sort !== DEFAULT_SORT) {
    params.set('sort', filters.sort);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function hasActiveFilters(filters: AnimalFilters): boolean {
  return Boolean(
    filters.q ||
    filters.species ||
    filters.sex ||
    filters.size ||
    filters.status,
  );
}
