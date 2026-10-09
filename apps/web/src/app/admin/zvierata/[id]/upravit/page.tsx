import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { updateAnimal } from '@/actions/animals';
import { AnimalForm } from '@/components/admin/animal-form';
import { ErrorState } from '@/components/states';
import { animalPath, parseAnimalId } from '@/lib/animals';
import { getAnimal } from '@/lib/data/animals';

export const metadata: Metadata = { title: 'Úprava zvieraťa' };

export default async function EditAnimalPage({
  params,
}: PageProps<'/admin/zvierata/[id]/upravit'>) {
  const id = parseAnimalId((await params).id);
  if (id === null) {
    notFound();
  }
  const result = await getAnimal(id);
  if (!result.ok) {
    if (result.error.status === 404) {
      notFound();
    }
    return (
      <ErrorState error={result.error} title="Zviera sa nepodarilo načítať" />
    );
  }

  const animal = result.data;
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-5xl">Úprava: {animal.name}</h1>
      <p className="mt-3 mb-8 text-lg text-muted-foreground">
        Zmeny sa hneď prejavia na{' '}
        <Link href={animalPath(animal)} className="underline">
          stránke zvieraťa
        </Link>
        .
      </p>
      <AnimalForm
        action={updateAnimal.bind(null, animal.id)}
        animal={animal}
        submitLabel="Uložiť zmeny"
      />
    </div>
  );
}
