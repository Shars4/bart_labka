import Link from 'next/link';
import { TennisBall } from '@/components/brand';
import { API_DOCS_URL } from '@/lib/env';

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="page-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="max-w-md">
          <p className="flex items-center gap-2.5 font-display text-xl font-extrabold">
            <TennisBall className="size-7" />
            Útulok Labka
          </p>
          <p className="mt-4 text-white/80">
            Ukážková aplikácia útulku: zvieratá aj žiadosti sú vymyslené,
            fotografie pochádzajú z Wikimedia Commons.
          </p>
        </div>
        <nav aria-label="Odkazy v pätičke">
          <ul className="grid gap-2 font-semibold">
            <li>
              <Link href="/zvierata" className="hover:text-tennis">
                Zvieratá na adopciu
              </Link>
            </li>
            <li>
              <a href={API_DOCS_URL} className="hover:text-tennis">
                Dokumentácia API (Swagger)
              </a>
            </li>
            <li>
              <a
                href="/images/animals/CREDITS.md"
                className="hover:text-tennis"
              >
                Autori fotografií
              </a>
            </li>
            <li>
              <Link href="/prihlasenie" className="hover:text-tennis">
                Prihlásenie pre správcov
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
