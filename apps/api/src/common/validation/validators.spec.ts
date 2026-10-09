import { validateSync } from 'class-validator';
import { todayInShelter } from '../dates.js';
import { IsDateOnly, IsImageUrl, IsNotInFuture } from './validators.js';

class Sample {
  @IsDateOnly()
  date: unknown = '2026-01-01';

  @IsNotInFuture()
  pastDate: unknown = '2026-01-01';

  @IsImageUrl()
  image: unknown = '/images/animals/bella.jpg';
}

function invalidProperties(values: Partial<Sample>): string[] {
  return validateSync(Object.assign(new Sample(), values)).map(
    (error) => error.property,
  );
}

describe('IsDateOnly', () => {
  it.each(['2026-02-28', '2024-02-29'])('accepts %s', (date) => {
    expect(invalidProperties({ date })).toEqual([]);
  });

  it.each([
    '2026-02-30',
    '2025-02-29',
    '2026-13-01',
    '26-01-01',
    '2026-01-01T00:00:00Z',
    20260101,
  ])('rejects %s', (date) => {
    expect(invalidProperties({ date })).toEqual(['date']);
  });
});

describe('IsNotInFuture', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the shelter's calendar day, not the server's UTC day", () => {
    // 22:30 UTC on 9 Oct is already 00:30 on 10 Oct in Bratislava (UTC+2).
    vi.useFakeTimers({ now: new Date('2026-10-09T22:30:00Z') });

    expect(todayInShelter()).toBe('2026-10-10');
    expect(invalidProperties({ pastDate: '2026-10-10' })).toEqual([]);
    expect(invalidProperties({ pastDate: '2026-10-11' })).toEqual(['pastDate']);
  });
});

describe('IsImageUrl', () => {
  it.each([
    '/images/animals/bella.jpg',
    '/images/og.webp',
    'https://upload.wikimedia.org/photo.jpg',
    'http://example.com/a.png',
  ])('accepts %s', (image) => {
    expect(invalidProperties({ image })).toEqual([]);
  });

  it.each([
    'javascript:alert(1)',
    '/images/../secret.jpg',
    '/images/animals/bella.exe',
    '/etc/passwd',
    'ftp://example.com/a.jpg',
    'example.com/a.jpg',
  ])('rejects %s', (image) => {
    expect(invalidProperties({ image })).toEqual(['image']);
  });
});
