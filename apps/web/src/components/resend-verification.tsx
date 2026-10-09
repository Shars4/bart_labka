'use client';

import { CheckIcon, Loader2Icon } from 'lucide-react';
import { useActionState, useId } from 'react';
import { type ResendState, resendVerification } from '@/actions/session';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState: ResendState = { status: 'idle' };

/**
 * Sends a new verification link to `email`. With no email known (e.g. an
 * expired link), the visitor types it in.
 */
export function ResendVerification({ email }: { email?: string }) {
  const [state, formAction, pending] = useActionState(
    resendVerification,
    initialState,
  );
  const emailId = useId();

  if (state.status === 'sent') {
    return (
      <p role="status" className="flex items-center gap-2 font-semibold">
        <CheckIcon aria-hidden="true" className="size-5" />
        Ak účet čaká na overenie, nový odkaz je na ceste do vašej schránky.
      </p>
    );
  }

  return (
    <form action={formAction} className="grid gap-3">
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <div>
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1.5"
          />
        </div>
      )}
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        aria-busy={pending}
        className="justify-self-start"
      >
        {pending ? (
          <Loader2Icon className="animate-spin" aria-hidden="true" />
        ) : null}
        Poslať overovací email znova
      </Button>
      {state.status === 'error' ? (
        <p role="alert" className="font-semibold text-destructive">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
