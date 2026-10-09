import {
  CheckIcon,
  MailIcon,
  PhoneIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import {
  deleteAdoptionRequest,
  resolveAdoptionRequest,
} from '@/actions/adoption-requests';
import { AnimalPhoto } from '@/components/animal-photo';
import { RequestStatusBadge } from '@/components/request-status-badge';
import { Button } from '@/components/ui/button';
import { animalPath } from '@/lib/animals';
import type { components } from '@/lib/api/schema';
import { ConfirmDialog } from './confirm-dialog';

type AdoptionRequest = components['schemas']['AdoptionRequestDto'];

const receivedAt = new Intl.DateTimeFormat('sk-SK', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Bratislava',
});

export function AdoptionRequestCard({ request }: { request: AdoptionRequest }) {
  const { animal } = request;
  const pending = request.status === 'PENDING';

  return (
    <article className="rounded-3xl border border-border p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href={animalPath(animal)}
          className="flex items-center gap-3 hover:underline"
        >
          <AnimalPhoto
            src={animal.imageUrl}
            alt=""
            sizes="3rem"
            className="size-12 shrink-0 rounded-xl"
          />
          <span className="font-display text-xl font-bold">{animal.name}</span>
        </Link>
        <RequestStatusBadge status={request.status} />
      </div>

      <h3 className="mt-4 text-2xl">{request.fullName}</h3>
      <ul className="mt-1 flex flex-wrap gap-x-6">
        <li>
          <a
            href={`mailto:${request.email}`}
            className="inline-flex min-h-11 items-center gap-2 underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
          >
            <MailIcon aria-hidden="true" className="size-4" />
            {request.email}
          </a>
        </li>
        {request.phone ? (
          <li>
            <a
              href={`tel:${request.phone.replaceAll(' ', '')}`}
              className="inline-flex min-h-11 items-center gap-2 underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              <PhoneIcon aria-hidden="true" className="size-4" />
              {request.phone}
            </a>
          </li>
        ) : null}
      </ul>

      <blockquote className="mt-4 rounded-2xl bg-mist px-4 py-3 whitespace-pre-line">
        {request.message}
      </blockquote>
      <p className="mt-3 text-sm text-muted-foreground">
        Prijatá{' '}
        <time dateTime={request.createdAt}>
          {receivedAt.format(new Date(request.createdAt))}
        </time>
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        {pending ? (
          <>
            <ConfirmDialog
              trigger={
                <Button size="sm">
                  <CheckIcon aria-hidden="true" />
                  Schváliť
                </Button>
              }
              title={`Schváliť žiadosť pre „${animal.name}“?`}
              description={`Zviera sa označí ako adoptované a ostatné čakajúce žiadosti o neho sa zamietnu. Žiadateľovi (${request.fullName}) sa ozvite sami.`}
              confirmLabel="Schváliť"
              successMessage={`Schválené: ${request.fullName}`}
              action={resolveAdoptionRequest.bind(null, request.id, 'APPROVED')}
            />
            <ConfirmDialog
              trigger={
                <Button variant="outline" size="sm">
                  <XIcon aria-hidden="true" />
                  Zamietnuť
                </Button>
              }
              title="Zamietnuť žiadosť?"
              description={`Žiadosť od ${request.fullName} bude vybavená ako zamietnutá. Zviera zostane dostupné.`}
              confirmLabel="Zamietnuť"
              successMessage={`Zamietnuté: ${request.fullName}`}
              action={resolveAdoptionRequest.bind(null, request.id, 'REJECTED')}
            />
          </>
        ) : null}
        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm" className="text-destructive">
              <Trash2Icon aria-hidden="true" />
              Zmazať
            </Button>
          }
          title="Zmazať žiadosť?"
          description={`Žiadosť od ${request.fullName} sa natrvalo odstráni.`}
          confirmLabel="Zmazať"
          successMessage={`Zmazaná žiadosť: ${request.fullName}`}
          action={deleteAdoptionRequest.bind(null, request.id)}
          destructive
        />
      </div>
    </article>
  );
}
