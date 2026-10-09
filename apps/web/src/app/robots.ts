import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/prihlasenie',
        '/registracia',
        '/overenie-emailu',
        '/moje-ziadosti',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
