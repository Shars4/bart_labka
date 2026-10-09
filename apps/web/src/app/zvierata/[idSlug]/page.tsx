import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Suspense } from 'react';
import { AdminEditLink } from '@/components/admin/admin-edit-link';
import { AnimalPhoto } from '@/components/animal-photo';
import { BackLink } from '@/components/back-link';
import { ErrorState } from '@/components/states';
import { StatusBadge } from '@/components/status-badge';
import { buttonVariants } from '@/components/ui/button';
import {
  type Animal,
  SEX_LABELS,
  SIZE_LABELS,
  SPECIES_LABELS,
  animalPath,
  formatAge,
  formatDate,
  parseAnimalId,
} from '@/lib/animals';
import type { ApiError } from '@/lib/api/errors';
import { getSession } from '@/lib/auth';
import { getAnimal } from '@/lib/data/animals';
import { noIndex, pageMetadata } from '@/lib/seo';
import { AdoptionForm } from './adoption-form';

type Props = PageProps<'/zvierata/[idSlug]'>;

/**
 * Blocking route (no prerendered shell): the response starts only after the
 * animal is loaded, so an unknown id gets a real HTTP 404 and an outdated
 * slug a real 308 redirect, instead of a 200 that streams them in later.
 */
export const instant = false;

/**
 * Resolves the animal or ends the request: unknown ids are a real 404,
 * because this runs before anything is streamed.
 */
async function loadAnimal(
  idSlug: string,
): Promise<{ animal: Animal } | { error: ApiError }> {
  const id = parseAnimalId(idSlug);
  if (id === null) {
    notFound();
  }
  const result = await getAnimal(id);
  if (!result.ok) {
    if (result.error.status === 404) {
      notFound();
    }
    return { error: result.error };
  }
  return { animal: result.data };
}

const TITLES: Record<Animal['status'], (name: string) => string> = {
  AVAILABLE: (name) => `${name} hľadá domov`,
  RESERVED: (name) => `${name} (rezervované)`,
  ADOPTED: (name) => `${name} už má domov`,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadAnimal((await params).idSlug);
  if ('error' in loaded) {
    return { title: 'Zviera', ...noIndex };
  }
  const { animal } = loaded;
  return pageMetadata({
    title: TITLES[animal.status](animal.name),
    description: excerpt(
      `${animal.breed ?? SPECIES_LABELS[animal.species]}. ${animal.description}`,
      160,
    ),
    path: animalPath(animal),
    image: animal.imageUrl
      ? { url: animal.imageUrl, alt: animal.name }
      : undefined,
  });
}

export default async function AnimalPage({ params }: Props) {
  const { idSlug } = await params;
  const loaded = await loadAnimal(idSlug);

  if ('error' in loaded) {
    return (
      <div className="page-container py-10 md:py-14">
        <BackLink />
        <ErrorState
          error={loaded.error}
          title="Zviera sa nepodarilo načítať"
          className="mt-6"
        />
      </div>
    );
  }

  const { animal } = loaded;
  // /zvierata/1 or /zvierata/1-old-name lead to the one canonical URL.
  const canonical = animalPath(animal);
  if (`/zvierata/${idSlug}` !== canonical) {
    permanentRedirect(canonical);
  }
  // Signed-in users get the form prefilled; deduplicated with the header.
  const session = await getSession();
  const account =
    session.status === 'authenticated'
      ? { name: session.user.name, email: session.user.email }
      : undefined;

  return (
    <div className="page-container py-8 md:py-12">
      <BackLink />

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <AnimalPhoto
          src={animal.imageUrl}
          alt={animal.name}
          priority
          sizes="(min-width: 1024px) 34rem, 100vw"
          className="aspect-[4/3] rounded-[2rem] lg:sticky lg:top-24 lg:self-start"
        />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StatusBadge status={animal.status} />
            <Suspense fallback={null}>
              <AdminEditLink animalId={animal.id} />
            </Suspense>
          </div>
          <h1 className="mt-4 text-6xl [font-stretch:85%] md:text-7xl">
            {animal.name}
          </h1>
          <p className="mt-3 text-xl text-muted-foreground">
            {animal.breed ?? SPECIES_LABELS[animal.species]}
          </p>

          <p className="mt-8 text-lg leading-relaxed whitespace-pre-line">
            {animal.description}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-8 sm:grid-cols-3">
            <Fact label="Druh">{SPECIES_LABELS[animal.species]}</Fact>
            <Fact label="Pohlavie">{SEX_LABELS[animal.sex]}</Fact>
            <Fact label="Vek">
              {animal.birthDate ? formatAge(animal.birthDate) : 'neznámy'}
            </Fact>
            <Fact label="Veľkosť">{SIZE_LABELS[animal.size]}</Fact>
            <Fact label="Očkovanie">{animal.isVaccinated ? 'áno' : 'nie'}</Fact>
            <Fact label="Kastrácia">{animal.isNeutered ? 'áno' : 'nie'}</Fact>
            <Fact label="V útulku od" wide>
              {formatDate(animal.intakeDate)}
            </Fact>
          </dl>

          {animal.status === 'AVAILABLE' ? (
            <a
              href="#ziadost"
              className={buttonVariants({ size: 'lg', className: 'mt-10' })}
            >
              Požiadať o adopciu
            </a>
          ) : null}
        </div>
      </div>

      <section
        id="ziadost"
        aria-labelledby="ziadost-nadpis"
        className="mt-16 scroll-mt-24 rounded-[2rem] bg-sky px-5 py-8 sm:px-8 md:px-12 md:py-12"
      >
        {animal.status === 'AVAILABLE' ? (
          <div className="max-w-2xl">
            <h2 id="ziadost-nadpis" className="text-4xl">
              Žiadosť o adopciu
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Napíšte nám o sebe. Do troch pracovných dní sa vám ozveme a
              dohodneme si návštevu v útulku.
            </p>
            <AdoptionForm
              animalId={animal.id}
              account={account}
              loginHref={`/prihlasenie?next=${encodeURIComponent(canonical)}`}
            />
          </div>
        ) : (
          <div className="max-w-2xl">
            <h2 id="ziadost-nadpis" className="text-4xl">
              {animal.status === 'RESERVED'
                ? 'Toto zviera je rezervované'
                : 'Toto zviera už našlo domov'}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Žiadosti o adopciu momentálne neprijímame. V útulku však čakajú
              ďalšie zvieratá.
            </p>
            <Link
              href="/zvierata?status=AVAILABLE"
              className={buttonVariants({ size: 'lg', className: 'mt-6' })}
            >
              Zvieratá, ktoré hľadajú domov
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Fact({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'col-span-2 sm:col-span-1' : undefined}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold">{children}</dd>
    </div>
  );
}

function excerpt(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`;
}
