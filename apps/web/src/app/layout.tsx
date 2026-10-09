import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Figtree } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { Toaster } from '@/components/ui/sonner';
import { SITE_NAME, SITE_URL } from '@/lib/env';
import { DEFAULT_OG_IMAGE } from '@/lib/seo';
import './globals.css';

// latin-ext carries the Slovak diacritics (č, ď, ľ, ň, ô, ŕ, š, ť, ž ...).
const display = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz', 'wdth'],
  variable: '--font-display',
  display: 'swap',
});

const body = Figtree({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

const DEFAULT_TITLE = 'Útulok Labka – psy, mačky a ďalšie zvieratá na adopciu';
const DEFAULT_DESCRIPTION =
  'Psy, mačky a menšie zvieratá z Útulku Labka hľadajú nový domov. Pozrite si, kto na vás čaká, a pošlite žiadosť o adopciu online.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="sk" className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#obsah"
          className="sr-only z-50 rounded-full bg-tennis font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-5 focus:py-3"
        >
          Preskočiť na obsah
        </a>
        <SiteHeader />
        <main id="obsah" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
