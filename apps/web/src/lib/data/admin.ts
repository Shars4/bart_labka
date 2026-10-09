import 'server-only';
import { callApi } from '@/lib/api/client';
import type { paths } from '@/lib/api/schema';

/** Admin-only reads; the API rejects them without a valid admin token. */

export const ADMIN_PAGE_SIZE = 20;

export function getStats() {
  return callApi((api) => api.GET('/api/stats'));
}

export function getAdminAnimals(page: number) {
  return callApi((api) =>
    api.GET('/api/animals', {
      params: { query: { page, pageSize: ADMIN_PAGE_SIZE, sort: 'newest' } },
    }),
  );
}

export type AdoptionRequestQuery = NonNullable<
  paths['/api/adoption-requests']['get']['parameters']['query']
>;

export function getAdoptionRequests(query: AdoptionRequestQuery) {
  return callApi((api) =>
    api.GET('/api/adoption-requests', { params: { query } }),
  );
}
