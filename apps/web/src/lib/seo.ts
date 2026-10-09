import type { Metadata } from 'next';
import { SITE_NAME } from './env';

export const DEFAULT_OG_IMAGE = {
  url: '/images/og.jpg',
  width: 1200,
  height: 630,
  alt: 'Labradorka Bella z Útulku Labka',
};

interface PageMetadataInput {
  title: string;
  description: string;
  /** Path of the page, e.g. "/zvierata"; becomes the canonical URL. */
  path: string;
  image?: { url: string; alt: string; width?: number; height?: number };
}

/**
 * Metadata for a public page. Next.js replaces (does not merge) the
 * openGraph object of parent layouts, so every page sets all of it.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'sk_SK',
      siteName: SITE_NAME,
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
  };
}

/** Admin and login pages stay out of search results. */
export const noIndex: Metadata = { robots: { index: false, follow: false } };
