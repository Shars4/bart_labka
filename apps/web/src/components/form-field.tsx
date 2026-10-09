import { Label } from '@/components/ui/label';

interface FormFieldProps {
  id: string;
  label: string;
  /** Validation message from the API, shown under the input. */
  error?: string;
  hint?: string;
  children: (describedBy: string | undefined) => React.ReactNode;
}

/**
 * Label, control, hint and error with the ARIA wiring, so screen readers
 * announce the error together with the field.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  children,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children(describedBy)}</div>
      {error ? (
        <p id={errorId} className="mt-1.5 font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
