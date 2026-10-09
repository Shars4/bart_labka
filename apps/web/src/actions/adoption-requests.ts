'use server';

import { revalidatePath } from 'next/cache';
import { callApi } from '@/lib/api/client';
import { redirectIfUnauthorized } from '@/lib/auth';
import type { ActionResult } from './animals';

/**
 * Approving also changes the animal (adopted) and its other requests
 * (rejected) in the API, so every page that shows animals is refreshed.
 */
export async function resolveAdoptionRequest(
  id: number,
  status: 'APPROVED' | 'REJECTED',
): Promise<ActionResult> {
  const result = await callApi((api) =>
    api.PATCH('/api/adoption-requests/{id}', {
      params: { path: { id } },
      body: { status },
    }),
  );
  if (!result.ok) {
    return {
      ok: false,
      message: redirectIfUnauthorized(result.error, '/admin/ziadosti').message,
    };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function deleteAdoptionRequest(id: number): Promise<ActionResult> {
  const result = await callApi((api) =>
    api.DELETE('/api/adoption-requests/{id}', { params: { path: { id } } }),
  );
  if (!result.ok) {
    return {
      ok: false,
      message: redirectIfUnauthorized(result.error, '/admin/ziadosti').message,
    };
  }
  revalidatePath('/admin', 'layout');
  return { ok: true };
}
