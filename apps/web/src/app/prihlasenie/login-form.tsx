'use client';

import { EyeIcon, EyeOffIcon, InfoIcon, Loader2Icon } from 'lucide-react';
import { useActionState, useId, useState } from 'react';
import { type LoginState, login } from '@/actions/session';
import { FormAlert } from '@/components/form-alert';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: LoginState = { status: 'idle' };

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const idPrefix = useId();
  const fid = (name: string) => `${idPrefix}-${name}`;
  const [showPassword, setShowPassword] = useState(false);
  const errors = state.status === 'error' ? state.fieldErrors : {};

  return (
    <form
      action={formAction}
      noValidate
      className="mt-8 rounded-3xl bg-sky p-5 sm:p-8"
    >
      <fieldset disabled={pending} className="grid min-w-0 gap-5">
        {notice && state.status === 'idle' ? (
          <p
            role="status"
            className="flex gap-3 rounded-2xl bg-background px-4 py-3 font-semibold"
          >
            <InfoIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            {notice}
          </p>
        ) : null}
        {state.status === 'error' ? (
          <FormAlert message={state.message} />
        ) : null}

        <input type="hidden" name="next" value={next} />

        <FormField id={fid('email')} label="Email" error={errors.email}>
          {(describedBy) => (
            <Input
              id={fid('email')}
              name="email"
              type="email"
              autoComplete="username"
              required
              defaultValue={state.status === 'error' ? state.email : undefined}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy}
            />
          )}
        </FormField>

        <FormField id={fid('password')} label="Heslo" error={errors.password}>
          {(describedBy) => (
            <div className="relative">
              <Input
                id={fid('password')}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-invalid={Boolean(errors.password)}
                aria-describedby={describedBy}
                className="pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? 'Skryť heslo' : 'Zobraziť heslo'}
                aria-pressed={showPassword}
                className="absolute top-1 right-1"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </Button>
            </div>
          )}
        </FormField>

        <Button type="submit" size="lg" aria-busy={pending}>
          {pending ? (
            <>
              <Loader2Icon className="animate-spin" aria-hidden="true" />
              Prihlasujem…
            </>
          ) : (
            'Prihlásiť sa'
          )}
        </Button>
      </fieldset>
    </form>
  );
}
