import type { Metadata } from 'next';
import { createAnimal } from '@/actions/animals';
import { AnimalForm } from '@/components/admin/animal-form';

export const metadata: Metadata = { title: 'Nové zviera' };

export default function NewAnimalPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl md:text-5xl">Nové zviera</h1>
      <p className="mt-3 mb-8 text-lg text-muted-foreground">
        Po uložení sa zviera hneď zobrazí na verejnej stránke útulku.
      </p>
      <AnimalForm action={createAnimal} submitLabel="Pridať zviera" />
    </div>
  );
}
