/**
 * Date-only values (birth date, intake date) travel as "YYYY-MM-DD" strings
 * and are stored in DATE columns, which Prisma maps to Date at UTC midnight.
 */

/** "Today" is decided in the shelter's time zone, not the server's (UTC). */
export const SHELTER_TIME_ZONE = 'Europe/Bratislava';

const dateOnlyFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: SHELTER_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function todayInShelter(): string {
  return dateOnlyFormat.format(new Date());
}

export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Parses "YYYY-MM-DD" as UTC midnight, matching how DATE columns are read. */
export function fromDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
