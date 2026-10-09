'use server';

import { callApi } from '@/lib/api/client';

const FIELDS = ['fullName', 'email', 'phone', 'message'] as const;
type Field = (typeof FIELDS)[number];

export type AdoptionFormState =
  | { status: 'idle' }
  | { status: 'success'; email: string }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<Field, string>>;
      /** Submitted values, so the form keeps what the visitor typed. */
      values: Record<Field, string>;
    };

/**
 * Sends the request to the API, which validates it. Its messages (per field
 * or for the whole form) are returned to the form as they are.
 */
export async function submitAdoptionRequest(
  animalId: number,
  _previous: AdoptionFormState,
  formData: FormData,
): Promise<AdoptionFormState> {
  const values = Object.fromEntries(
    FIELDS.map((field) => [field, String(formData.get(field) ?? '')]),
  ) as Record<Field, string>;

  // The id is bound on the client, so it is untrusted input like the rest.
  if (!Number.isInteger(animalId) || animalId < 1) {
    return {
      status: 'error',
      message: 'Neplatné zviera.',
      fieldErrors: {},
      values,
    };
  }

  const result = await callApi((api) =>
    api.POST('/api/animals/{animalId}/adoption-requests', {
      params: { path: { animalId } },
      body: { ...values, phone: values.phone.trim() || null },
    }),
  );

  if (!result.ok) {
    return {
      status: 'error',
      message: result.error.message,
      fieldErrors: result.error.fieldErrors,
      values,
    };
  }
  return { status: 'success', email: result.data.email };
}
