import { ExternalLinkIcon, FlaskConicalIcon } from 'lucide-react';

/**
 * In the demo, emails never leave the machine: Mailpit catches them. Tells
 * the visitor where to find the verification link. Hidden when no mailbox URL
 * is configured (e.g. in production with a real SMTP server).
 */
export function DemoMailboxNotice({ url }: { url?: string }) {
  if (!url) {
    return null;
  }
  return (
    <div className="flex gap-3 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-3">
      <FlaskConicalIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">Ide o demo overenie</p>
        <p className="mt-1">
          Emaily z tejto ukážky neodchádzajú do skutočnej schránky. Overovací
          odkaz nájdete v testovacej schránke Mailpit.
        </p>
        <p className="mt-2">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline underline-offset-4"
          >
            Otvoriť testovaciu{' '}
            <span className="whitespace-nowrap">
              schránku
              <ExternalLinkIcon
                aria-hidden="true"
                className="ml-1.5 inline size-4 align-[-2px]"
              />
            </span>
            <span className="sr-only"> (otvorí sa v novom okne)</span>
          </a>
        </p>
      </div>
    </div>
  );
}
