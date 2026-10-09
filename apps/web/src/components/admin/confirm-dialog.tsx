'use client';

import { Loader2Icon } from 'lucide-react';
import { type ReactElement, useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { ActionResult } from '@/actions/animals';
import { FormAlert } from '@/components/form-alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  /** The button that opens the dialog. */
  trigger: ReactElement;
  title: string;
  description: string;
  confirmLabel: string;
  /** Shown as a toast when the action succeeds. */
  successMessage: string;
  /** A Server Action, usually bound to the record's id. */
  action: () => Promise<ActionResult>;
  destructive?: boolean;
}

/**
 * Asks before an action that cannot be undone. Stays open while the action
 * runs; an error from the API is shown inside the dialog.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel,
  successMessage,
  action,
  destructive,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setOpen(false);
        toast.success(successMessage);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next);
          setError(null);
        }
      }}
    >
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-5 rounded-3xl p-6 sm:max-w-md">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle className="text-2xl font-bold">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? <FormAlert message={error} /> : null}
        <AlertDialogFooter className="-mx-6 -mb-6 rounded-b-3xl bg-mist p-4 sm:px-6">
          <AlertDialogCancel disabled={pending}>Zrušiť</AlertDialogCancel>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            onClick={confirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : null}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
