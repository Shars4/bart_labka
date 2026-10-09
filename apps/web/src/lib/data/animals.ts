import 'server-only';
import { cache } from 'react';
import { callApi } from '@/lib/api/client';
import type { paths } from '@/lib/api/schema';

export type AnimalListQuery = NonNullable<
  paths['/api/animals']['get']['parameters']['query']
>;

export function getAnimals(query: AnimalListQuery) {
  return callApi((api) => api.GET('/api/animals', { params: { query } }));
}

/**
 * Deduplicated per request: the page and generateMetadata both need the
 * animal, but the API is called once.
 */
export const getAnimal = cache((id: number) =>
  callApi((api) => api.GET('/api/animals/{id}', { params: { path: { id } } })),
);
