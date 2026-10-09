'use client';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { type ComponentProps, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Password field with a button that shows or hides what was typed. */
export function PasswordInput(
  props: Omit<ComponentProps<typeof Input>, 'type'>,
) {
  const [shown, setShown] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={shown ? 'text' : 'password'} className="pr-12" />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => setShown((value) => !value)}
        aria-label={shown ? 'Skryť heslo' : 'Zobraziť heslo'}
        aria-pressed={shown}
        className="absolute top-1 right-1"
      >
        {shown ? <EyeOffIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
}
