import type { MetadataRoute } from 'next';
import { connection } from 'next/server';
import { animalPath } from '@/lib/animals';
import { getAnimals } from '@/lib/data/animals';
import { SITE_URL } from '@/lib/env';

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

/**
 * Built per request (the API is not reachable while the image is built).
 * Lists every animal page, including adopted ones: they stay reachable.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/zvierata`, changeFrequency: 'daily', priority: 0.9 },
  ];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const result = await getAnimals({ page, pageSize: PAGE_SIZE });
    if (!result.ok) {
      // Better a partial sitemap than none.
      break;
    }
    for (const animal of result.data.data) {
      entries.push({
        url: `${SITE_URL}${animalPath(animal)}`,
        lastModified: animal.updatedAt,
        changeFrequency: 'weekly',
        priority: animal.status === 'AVAILABLE' ? 0.8 : 0.4,
      });
    }
    if (page >= result.data.meta.totalPages) {
      break;
    }
  }

  return entries;
}
