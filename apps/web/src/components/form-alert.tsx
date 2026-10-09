import { CircleAlertIcon } from 'lucide-react';

/** Form-level error (e.g. a conflict or the API being down). */
export function FormAlert({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex gap-3 rounded-2xl border-2 border-destructive/40 bg-[#fff5f5] px-4 py-3 font-semibold"
    >
      <CircleAlertIcon
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-destructive"
      />
      <p>{message}</p>
    </div>
  );
}
