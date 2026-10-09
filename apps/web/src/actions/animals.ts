'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { callApi } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import { redirectIfUnauthorized } from '@/lib/auth';

type CreateAnimalBody = components['schemas']['CreateAnimalDto'];

const TEXT_FIELDS = [
  'name',
  'species',
  'breed',
  'sex',
  'size',
  'birthDate',
  'intakeDate',
  'description',
  'imageUrl',
  'status',
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

export type AnimalFormValues = Record<TextField, string> & {
  isVaccinated: boolean;
  isNeutered: boolean;
};

export type AnimalFormState =
  | { status: 'idle' }
  | {
      status: 'error';
      message: string;
      fieldErrors: Partial<Record<TextField, string>>;
      values: AnimalFormValues;
    };

export type ActionResult = { ok: true } | { ok: false; message: string };

function readForm(formData: FormData): {
  values: AnimalFormValues;
  body: CreateAnimalBody;
} {
  const text = Object.fromEntries(
    TEXT_FIELDS.map((field) => [field, String(formData.get(field) ?? '')]),
  ) as Record<TextField, string>;
  const values = {
    ...text,
    isVaccinated: formData.get('isVaccinated') === 'on',
    isNeutered: formData.get('isNeutered') === 'on',
  };

  // Empty optional fields become null (cleared); an empty intake date is
  // left out, so the API uses today. Everything is validated by the API.
  const body = {
    name: text.name,
    species: text.species,
    breed: text.breed || null,
    sex: text.sex,
    size: text.size,
    birthDate: text.birthDate || null,
    intakeDate: text.intakeDate || undefined,
    description: text.description,
    imageUrl: text.imageUrl || null,
    isVaccinated: values.isVaccinated,
    isNeutered: values.isNeutered,
    status: text.status || undefined,
  } as CreateAnimalBody;

  return { values, body };
}

function savedRedirect(notice: 'pridane' | 'ulozene', name: string): never {
  // Public pages and the admin list all show animals.
  revalidatePath('/', 'layout');
  redirect(`/admin?oznam=${notice}&meno=${encodeURIComponent(name)}`);
}

export async function createAnimal(
  _previous: AnimalFormState,
  formData: FormData,
): Promise<AnimalFormState> {
  const { values, body } = readForm(formData);
  const result = await callApi((api) => api.POST('/api/animals', { body }));
  if (!result.ok) {
    const error = redirectIfUnauthorized(result.error, '/admin/zvierata/nove');
    return {
      status: 'error',
      message: error.message,
      fieldErrors: error.fieldErrors,
      values,
    };
  }
  savedRedirect('pridane', result.data.name);
}

export async function updateAnimal(
  id: number,
  _previous: AnimalFormState,
  formData: FormData,
): Promise<AnimalFormState> {
  const { values, body } = readForm(formData);
  const result = await callApi((api) =>
    api.PATCH('/api/animals/{id}', { params: { path: { id } }, body }),
  );
  if (!result.ok) {
    const error = redirectIfUnauthorized(
      result.error,
      `/admin/zvierata/${id}/upravit`,
    );
    return {
      status: 'error',
      message: error.message,
      fieldErrors: error.fieldErrors,
      values,
    };
  }
  savedRedirect('ulozene', result.data.name);
}

export async function deleteAnimal(id: number): Promise<ActionResult> {
  const result = await callApi((api) =>
    api.DELETE('/api/animals/{id}', { params: { path: { id } } }),
  );
  if (!result.ok) {
    return {
      ok: false,
      message: redirectIfUnauthorized(result.error, '/admin').message,
    };
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}
