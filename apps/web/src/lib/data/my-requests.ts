import 'server-only';
import { callApi } from '@/lib/api/client';

export const MY_REQUESTS_PAGE_SIZE = 10;

/** The signed-in user's own adoption requests (any signed-in account). */
export function getMyAdoptionRequests(page: number) {
  return callApi((api) =>
    api.GET('/api/me/adoption-requests', {
      params: { query: { page, pageSize: MY_REQUESTS_PAGE_SIZE } },
    }),
  );
}
