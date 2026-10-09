'use client';

import { Loader2Icon, MailCheckIcon } from 'lucide-react';
import { useActionState, useEffect, useId, useRef } from 'react';
import { type RegisterState, register } from '@/actions/session';
import { DemoMailboxNotice } from '@/components/demo-mailbox-notice';
import { FormAlert } from '@/components/form-alert';
import { FormField } from '@/components/form-field';
import { PasswordInput } from '@/components/password-input';
import { ResendVerification } from '@/components/resend-verification';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: RegisterState = { status: 'idle' };

export function RegisterForm({ mailboxUrl }: { mailboxUrl?: string }) {
  const [state, formAction, pending] = useActionState(register, initialState);
  const idPrefix = useId();
  const fid = (name: string) => `${idPrefix}-${name}`;
  const errors = state.status === 'error' ? state.fieldErrors : {};
  const values = state.status === 'error' ? state.values : undefined;
  const doneRef = useRef<HTMLHeadingElement>(null);

  // The form is replaced by the confirmation; move focus there for screen
  // reader and keyboard users.
  useEffect(() => {
    if (state.status === 'registered') {
      doneRef.current?.focus();
    }
  }, [state.status]);

  if (state.status === 'registered') {
    return (
      <div className="mt-8 rounded-3xl bg-sky p-5 sm:p-8">
        <MailCheckIcon aria-hidden="true" className="size-10" />
        <h2 ref={doneRef} tabIndex={-1} className="mt-4 text-3xl outline-none">
          Skontrolujte svoju schránku
        </h2>
        <p className="mt-3">
          Na adresu <strong>{state.email}</strong> sme poslali odkaz na overenie
          emailu. Po jeho otvorení sa môžete prihlásiť.
        </p>
        <div className="mt-6">
          <DemoMailboxNotice url={mailboxUrl} />
        </div>
        <div className="mt-6">
          <ResendVerification email={state.email} />
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      className="mt-8 rounded-3xl bg-sky p-5 sm:p-8"
    >
      <fieldset disabled={pending} className="grid min-w-0 gap-5">
        {state.status === 'error' ? (
          <FormAlert message={state.message} />
        ) : null}

        <FormField
          id={fid('name')}
          label="Meno a priezvisko"
          error={errors.name}
        >
          {(describedBy) => (
            <Input
              id={fid('name')}
              name="name"
              autoComplete="name"
              required
              defaultValue={values?.name}
              aria-invalid={Boolean(errors.name)}
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
              defaultValue={values?.email}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>

        <FormField
          id={fid('password')}
          label="Heslo"
          error={errors.password}
          hint="Aspoň 8 znakov."
        >
          {(describedBy) => (
            <PasswordInput
              id={fid('password')}
              name="password"
              autoComplete="new-password"
              required
              aria-invalid={Boolean(errors.password)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>

        <Button type="submit" size="lg" aria-busy={pending}>
          {pending ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              Vytváram účet…
            </>
          ) : (
            'Vytvoriť účet'
          )}
        </Button>
      </fieldset>
    </form>
  );
}
