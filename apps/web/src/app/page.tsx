import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { TennisBall } from '@/components/brand';
import { SectionLink } from '@/components/section-link';
import { buttonVariants } from '@/components/ui/button';
import { pageMetadata } from '@/lib/seo';
import bella from '../../public/images/animals/bella.jpg';
import { LatestAnimals, LatestAnimalsSkeleton } from './latest-animals';

export const metadata: Metadata = pageMetadata({
  title: 'Útulok Labka – psy, mačky a ďalšie zvieratá na adopciu',
  description:
    'Psy, mačky a menšie zvieratá z Útulku Labka hľadajú nový domov. Pozrite si, kto na vás čaká, a pošlite žiadosť o adopciu online.',
  path: '/',
});

const ADOPTION_STEPS = [
  {
    title: 'Vyberte si zviera',
    text: 'Prezrite si zvieratá na adopciu. Filtrovať môžete podľa druhu, veľkosti aj pohlavia.',
  },
  {
    title: 'Pošlite žiadosť',
    text: 'Na stránke zvieraťa vyplníte krátky formulár. Registrácia nie je potrebná.',
  },
  {
    title: 'Spoznajte sa',
    text: 'Do troch pracovných dní sa vám ozveme a dohodneme návštevu v útulku.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="page-container grid items-center gap-12 pt-10 pb-16 md:grid-cols-[1.15fr_1fr] md:pt-16 md:pb-24">
        <div>
          <h1 className="text-[clamp(2.75rem,7.5vw,5.5rem)] leading-[0.95] tracking-[-0.035em] [font-stretch:85%]">
            Nájdite parťáka, ktorý na vás čaká.
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg text-muted-foreground md:text-xl">
            V Útulku Labka žijú psy, mačky aj menšie zvieratá, ktoré hľadajú
            nový domov. Keď vás niekto zaujme, žiadosť o adopciu pošlete priamo
            z jeho stránky.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/zvierata" className={buttonVariants({ size: 'lg' })}>
              Pozrieť zvieratá
            </Link>
            <SectionLink
              href="#ako-adoptovat"
              className={buttonVariants({ variant: 'secondary', size: 'lg' })}
            >
              Ako prebieha adopcia
            </SectionLink>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <Image
            src={bella}
            alt="Usmiata labradorka Bella na pozadí modrej oblohy"
            loading="eager"
            fetchPriority="high"
            placeholder="blur"
            sizes="(min-width: 768px) 45vw, 100vw"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover object-[72%_50%]"
          />
          <TennisBall className="absolute -bottom-6 left-3 size-16 drop-shadow-sm md:-bottom-7 md:-left-5 md:size-24" />
        </div>
      </section>

      <section aria-labelledby="najnovsie" className="page-container pb-20">
        <h2 id="najnovsie" className="text-4xl md:text-5xl">
          Najnovšie v útulku
        </h2>
        <p className="mt-3 mb-10 max-w-xl text-lg text-muted-foreground">
          Zvieratá, ktoré k nám prišli naposledy a hľadajú domov.
        </p>
        {/* Request-time data: streams in while the rest of the page is static. */}
        <Suspense fallback={<LatestAnimalsSkeleton />}>
          <LatestAnimals />
        </Suspense>
      </section>

      <section
        id="ako-adoptovat"
        tabIndex={-1}
        className="scroll-mt-20 bg-sky outline-none"
      >
        <div className="page-container py-16 md:py-20">
          <h2 className="text-4xl md:text-5xl">Ako prebieha adopcia</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {ADOPTION_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-4 md:flex-col">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-tennis font-display text-xl font-extrabold"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-2xl">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
