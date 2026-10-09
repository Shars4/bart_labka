'use client';

import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useEffect, useId, useRef, useState } from 'react';
import type { AnimalFormState, AnimalFormValues } from '@/actions/animals';
import { FormAlert } from '@/components/form-alert';
import { FormField } from '@/components/form-field';
import { NativeSelect } from '@/components/native-select';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  type Animal,
  SEX_LABELS,
  SIZE_LABELS,
  SPECIES_LABELS,
  STATUS_LABELS,
} from '@/lib/animals';
import { ImagePicker } from './image-picker';

const DESCRIPTION_MAX = 2000;
const initialState: AnimalFormState = { status: 'idle' };

function valuesFromAnimal(animal?: Animal): AnimalFormValues {
  return {
    name: animal?.name ?? '',
    species: animal?.species ?? '',
    breed: animal?.breed ?? '',
    sex: animal?.sex ?? '',
    size: animal?.size ?? '',
    birthDate: animal?.birthDate ?? '',
    intakeDate: animal?.intakeDate ?? '',
    description: animal?.description ?? '',
    imageUrl: animal?.imageUrl ?? '',
    status: animal?.status ?? 'AVAILABLE',
    isVaccinated: animal?.isVaccinated ?? false,
    isNeutered: animal?.isNeutered ?? false,
  };
}

interface AnimalFormProps {
  /** createAnimal, or updateAnimal bound to the animal's id. */
  action: (
    state: AnimalFormState,
    formData: FormData,
  ) => Promise<AnimalFormState>;
  animal?: Animal;
  submitLabel: string;
}

/** Shared by "add" and "edit"; the API validates every field. */
export function AnimalForm({ action, animal, submitLabel }: AnimalFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const values =
    state.status === 'error' ? state.values : valuesFromAnimal(animal);
  const errors = state.status === 'error' ? state.fieldErrors : {};
  const formRef = useRef<HTMLFormElement>(null);
  // Unique ids: Next.js keeps recently visited pages mounted (hidden), so a
  // second form with the same fixed ids could take over labels and errors.
  const idPrefix = useId();
  const fid = (name: string) => `${idPrefix}-${name}`;

  // After a failed save, move focus to the first field that needs fixing.
  useEffect(() => {
    if (state.status === 'error') {
      formRef.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
    }
  }, [state]);

  const select = (
    name: 'species' | 'sex' | 'size' | 'status',
    label: string,
    options: Record<string, string>,
    placeholder?: string,
  ) => (
    <FormField id={fid(name)} label={label} error={errors[name]}>
      {(describedBy) => (
        <NativeSelect
          id={fid(name)}
          name={name}
          defaultValue={values[name]}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={describedBy}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {Object.entries(options).map(([value, optionLabel]) => (
            <option key={value} value={value}>
              {optionLabel}
            </option>
          ))}
        </NativeSelect>
      )}
    </FormField>
  );

  return (
    <form ref={formRef} action={formAction} noValidate>
      {/* Remounted after every failed save, so the fields show what was sent. */}
      <fieldset
        key={state.status === 'error' ? JSON.stringify(state) : 'initial'}
        disabled={pending}
        className="grid min-w-0 gap-6"
      >
        {state.status === 'error' ? (
          <FormAlert message={state.message} />
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id={fid('name')} label="Meno" error={errors.name}>
            {(describedBy) => (
              <Input
                id={fid('name')}
                name="name"
                required
                maxLength={50}
                defaultValue={values.name}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          {select('status', 'Stav', STATUS_LABELS)}
          {select('species', 'Druh', SPECIES_LABELS, 'Vyberte druh')}
          <FormField
            id={fid('breed')}
            label="Plemeno (nepovinné)"
            error={errors.breed}
            hint="Pri miešancoch napíšte „Kríženec“."
          >
            {(describedBy) => (
              <Input
                id={fid('breed')}
                name="breed"
                maxLength={60}
                defaultValue={values.breed}
                aria-invalid={Boolean(errors.breed)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          {select('sex', 'Pohlavie', SEX_LABELS, 'Vyberte pohlavie')}
          {select('size', 'Veľkosť', SIZE_LABELS, 'Vyberte veľkosť')}
          <FormField
            id={fid('birthDate')}
            label="Dátum narodenia (nepovinné)"
            error={errors.birthDate}
            hint="Ak ho nepoznáte presne, stačí približný."
          >
            {(describedBy) => (
              <Input
                id={fid('birthDate')}
                name="birthDate"
                type="date"
                defaultValue={values.birthDate}
                aria-invalid={Boolean(errors.birthDate)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
          <FormField
            id={fid('intakeDate')}
            label="V útulku od"
            error={errors.intakeDate}
            hint={
              animal ? undefined : 'Ak nevyplníte, použije sa dnešný dátum.'
            }
          >
            {(describedBy) => (
              <Input
                id={fid('intakeDate')}
                name="intakeDate"
                type="date"
                defaultValue={values.intakeDate}
                aria-invalid={Boolean(errors.intakeDate)}
                aria-describedby={describedBy}
              />
            )}
          </FormField>
        </div>

        <DescriptionField
          id={fid('description')}
          defaultValue={values.description}
          error={errors.description}
        />

        <ImagePicker
          idPrefix={idPrefix}
          defaultValue={values.imageUrl}
          error={errors.imageUrl}
        />

        <fieldset className="grid gap-3">
          <legend className="mb-2 text-[0.95rem] font-semibold">Zdravie</legend>
          {(
            [
              ['isVaccinated', 'Očkované'],
              ['isNeutered', 'Kastrované'],
            ] as const
          ).map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 text-base">
              <input
                type="checkbox"
                name={name}
                defaultChecked={values[name]}
                className="size-5 accent-ink"
              />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap gap-3 border-t border-border pt-6">
          <Button type="submit" size="lg" aria-busy={pending}>
            {pending ? (
              <>
                <Loader2Icon className="animate-spin" aria-hidden="true" />
                Ukladám…
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <Link
            href="/admin"
            className={buttonVariants({ variant: 'ghost', size: 'lg' })}
          >
            Zrušiť
          </Link>
        </div>
      </fieldset>
    </form>
  );
}

/**
 * Lives inside the keyed fieldset, so after a failed save it remounts and
 * the counter starts from the returned text.
 */
function DescriptionField({
  id,
  defaultValue,
  error,
}: {
  id: string;
  defaultValue: string;
  error?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);
  return (
    <FormField
      id={id}
      label="Popis"
      error={error}
      hint={`${length} / ${DESCRIPTION_MAX} znakov, aspoň 20. Povaha, zvyky, s kým vychádza.`}
    >
      {(describedBy) => (
        <Textarea
          id={id}
          name="description"
          required
          rows={6}
          maxLength={DESCRIPTION_MAX}
          defaultValue={defaultValue}
          onInput={(event) => setLength(event.currentTarget.value.length)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        />
      )}
    </FormField>
  );
}
