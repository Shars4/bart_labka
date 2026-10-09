'use client';

import { CircleCheckIcon, Loader2Icon } from 'lucide-react';
import { useActionState, useId, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { FormAlert } from '@/components/form-alert';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type AdoptionFormState, submitAdoptionRequest } from './actions';

const initialState: AdoptionFormState = { status: 'idle' };

/**
 * Validation is done by the API (one set of rules, in Slovak); `noValidate`
 * keeps browser bubbles from showing different messages first.
 */
export function AdoptionForm({ animalId }: { animalId: number }) {
  const [state, formAction, pending] = useActionState(
    submitAdoptionRequest.bind(null, animalId),
    initialState,
  );
  const idPrefix = useId();
  const fid = (name: string) => `${idPrefix}-${name}`;
  const confirmationRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Žiadosť sme prijali');
      confirmationRef.current?.focus();
    }
  }, [state]);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="mt-8 flex gap-4 rounded-3xl bg-background p-6 sm:p-8"
      >
        <CircleCheckIcon
          aria-hidden="true"
          className="size-8 shrink-0 text-success"
        />
        <div>
          <h3
            ref={confirmationRef}
            tabIndex={-1}
            className="text-2xl outline-none"
          >
            Ďakujeme, žiadosť sme prijali
          </h3>
          <p className="mt-2 text-muted-foreground">
            Ozveme sa vám na <strong>{state.email}</strong> do troch pracovných
            dní.
          </p>
        </div>
      </div>
    );
  }

  const errors = state.status === 'error' ? state.fieldErrors : {};
  const values = state.status === 'error' ? state.values : undefined;

  return (
    <form action={formAction} noValidate className="mt-8">
      {/* Locked while sending: React resets the form when the action
          finishes, so anything typed in the meantime would be lost. */}
      <fieldset disabled={pending} className="grid min-w-0 gap-5">
        {state.status === 'error' ? (
          <FormAlert message={state.message} />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id={fid('fullName')}
            label="Meno a priezvisko"
            error={errors.fullName}
          >
            {(describedBy) => (
              <Input
                id={fid('fullName')}
                name="fullName"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={values?.fullName}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          <FormField id={fid('email')} label="Email" error={errors.email}>
            {(describedBy) => (
              <Input
                id={fid('email')}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                defaultValue={values?.email}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
        </div>

        <FormField
          id={fid('phone')}
          label="Telefón (nepovinné)"
          error={errors.phone}
          hint="Ak vám chceme radšej zavolať, napr. +421 905 123 456."
        >
          {(describedBy) => (
            <Input
              id={fid('phone')}
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={20}
              defaultValue={values?.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy}
              className="sm:max-w-xs"
            />
          )}
        </FormField>

        <FormField
          id={fid('message')}
          label="Správa"
          error={errors.message}
          hint="Kde bývate, kto s vami žije a aké máte skúsenosti so zvieratami."
        >
          {(describedBy) => (
            <Textarea
              id={fid('message')}
              name="message"
              required
              minLength={10}
              maxLength={2000}
              rows={5}
              defaultValue={values?.message}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>

        <div>
          <Button
            type="submit"
            size="lg"
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Odosielam…
              </>
            ) : (
              'Odoslať žiadosť'
            )}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
