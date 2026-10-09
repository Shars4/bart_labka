import { PencilIcon, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { deleteAnimal } from '@/actions/animals';
import { AnimalPhoto } from '@/components/animal-photo';
import { StatusBadge } from '@/components/status-badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  type Animal,
  SPECIES_LABELS,
  animalPath,
  formatDate,
} from '@/lib/animals';
import { ConfirmDialog } from './confirm-dialog';

function Actions({ animal }: { animal: Animal }) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/zvierata/${animal.id}/upravit`}
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
      >
        <PencilIcon aria-hidden="true" />
        Upraviť<span className="sr-only"> {animal.name}</span>
      </Link>
      <ConfirmDialog
        trigger={
          <Button variant="ghost" size="sm" className="text-destructive">
            <Trash2Icon aria-hidden="true" />
            Zmazať<span className="sr-only"> {animal.name}</span>
          </Button>
        }
        title={`Zmazať „${animal.name}“?`}
        description="Zviera zmizne zo stránky útulku spolu so všetkými žiadosťami o jeho adopciu. Túto akciu nie je možné vrátiť."
        confirmLabel="Zmazať"
        successMessage={`Zmazané: ${animal.name}`}
        action={deleteAnimal.bind(null, animal.id)}
        destructive
      />
    </div>
  );
}

/** A table on wide screens, a list of cards on phones. */
export function AdminAnimalList({ animals }: { animals: Animal[] }) {
  return (
    <>
      <table className="hidden w-full text-left md:table">
        <thead className="border-b border-border text-sm text-muted-foreground">
          <tr>
            <th scope="col" className="py-3 pr-4 font-semibold">
              Zviera
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Druh
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Stav
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              V útulku od
            </th>
            <th scope="col" className="py-3 pl-4 font-semibold">
              <span className="sr-only">Akcie</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {animals.map((animal) => (
            <tr key={animal.id} className="border-b border-border">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <AnimalPhoto
                    src={animal.imageUrl}
                    alt=""
                    sizes="3.5rem"
                    className="size-14 shrink-0 rounded-xl"
                  />
                  <div>
                    <Link
                      href={animalPath(animal)}
                      className="font-semibold hover:underline"
                    >
                      {animal.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {animal.breed ?? '–'}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">{SPECIES_LABELS[animal.species]}</td>
              <td className="px-4 py-3">
                <StatusBadge status={animal.status} />
              </td>
              <td className="px-4 py-3">{formatDate(animal.intakeDate)}</td>
              <td className="py-3 pl-4">
                <div className="flex justify-end">
                  <Actions animal={animal} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="grid gap-3 md:hidden">
        {animals.map((animal) => (
          <li key={animal.id} className="rounded-2xl border border-border p-3">
            <div className="flex gap-3">
              <AnimalPhoto
                src={animal.imageUrl}
                alt=""
                sizes="4rem"
                className="size-16 shrink-0 rounded-xl"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={animalPath(animal)}
                    className="inline-flex min-h-11 items-center text-lg font-semibold hover:underline"
                  >
                    {animal.name}
                  </Link>
                  <StatusBadge status={animal.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {SPECIES_LABELS[animal.species]}, v útulku od{' '}
                  {formatDate(animal.intakeDate)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <Actions animal={animal} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
