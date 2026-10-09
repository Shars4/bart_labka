import type { components } from '@/lib/api/schema';

/** Pure helpers shared by server and client components. */

export type Animal = components['schemas']['AnimalDto'];
export type AnimalSummary = components['schemas']['AnimalSummaryDto'];
export type Species = components['schemas']['Species'];
export type Sex = components['schemas']['Sex'];
export type Size = components['schemas']['Size'];
export type AnimalStatus = components['schemas']['AnimalStatus'];
export type AnimalSort = components['schemas']['AnimalSort'];

export const SPECIES_LABELS: Record<Species, string> = {
  DOG: 'Pes',
  CAT: 'Mačka',
  RABBIT: 'Králik',
  OTHER: 'Iné zviera',
};

/** Plural forms for filters ("show me dogs"). */
export const SPECIES_PLURAL_LABELS: Record<Species, string> = {
  DOG: 'Psy',
  CAT: 'Mačky',
  RABBIT: 'Králiky',
  OTHER: 'Iné zvieratá',
};

export const SEX_LABELS: Record<Sex, string> = {
  MALE: 'Samec',
  FEMALE: 'Samica',
};

export const SIZE_LABELS: Record<Size, string> = {
  SMALL: 'Malá',
  MEDIUM: 'Stredná',
  LARGE: 'Veľká',
};

export const STATUS_LABELS: Record<AnimalStatus, string> = {
  AVAILABLE: 'Hľadá domov',
  RESERVED: 'Rezervované',
  ADOPTED: 'Adoptované',
};

export const SORT_LABELS: Record<AnimalSort, string> = {
  newest: 'Najnovšie v útulku',
  oldest: 'Najdlhšie v útulku',
  name: 'Podľa mena',
};

/**
 * Slovak plural form: 1 rok, 2–4 roky, 5 a viac rokov.
 * `forms` = [one, few (2–4), many].
 */
export function plural(count: number, forms: [string, string, string]): string {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}

/** "3 roky", "7 mesiacov", "menej ako mesiac" from a YYYY-MM-DD birth date. */
export function formatAge(birthDate: string, today = new Date()): string {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  let months =
    (today.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - birth.getUTCMonth());
  if (today.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }
  if (months < 1) {
    return 'menej ako mesiac';
  }
  if (months < 12) {
    return `${months} ${plural(months, ['mesiac', 'mesiace', 'mesiacov'])}`;
  }
  const years = Math.floor(months / 12);
  return `${years} ${plural(years, ['rok', 'roky', 'rokov'])}`;
}

const longDate = new Intl.DateTimeFormat('sk-SK', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "3. februára 2026" from a YYYY-MM-DD date. */
export function formatDate(date: string): string {
  return longDate.format(new Date(`${date}T00:00:00Z`));
}

/** Short description for cards: "Pes, samica, 4 roky". */
export function animalSummaryLine(animal: Animal): string {
  return [
    animal.breed ?? SPECIES_LABELS[animal.species],
    SEX_LABELS[animal.sex].toLowerCase(),
    animal.birthDate ? formatAge(animal.birthDate) : null,
  ]
    .filter(Boolean)
    .join(', ');
}

/** URL-safe name without diacritics: "Ňufko" -> "nufko". */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Canonical detail URL, e.g. /zvierata/1-bella. */
export function animalPath(animal: Pick<Animal, 'id' | 'name'>): string {
  const slug = slugify(animal.name);
  return `/zvierata/${animal.id}${slug ? `-${slug}` : ''}`;
}

/** Parses the "1-bella" route segment; the name part is only cosmetic. */
export function parseAnimalId(idSlug: string): number | null {
  const match = /^(\d{1,9})(?:-[a-z0-9-]*)?$/.exec(idSlug);
  return match ? Number(match[1]) : null;
}

export function isBundledImage(src: string): boolean {
  return src.startsWith('/');
}
