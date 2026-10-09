import { LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/session';
import { Button, buttonVariants } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

type Layout = 'desktop' | 'mobile';

/** What a signed-out visitor sees; also the fallback while the session loads. */
export function LoginLink({ layout }: { layout: Layout }) {
  return (
    <Link
      href="/prihlasenie"
      className={buttonVariants({
        variant: 'outline',
        size: layout === 'desktop' ? 'sm' : 'default',
        className: layout === 'desktop' ? 'hidden md:inline-flex' : 'w-full',
      })}
    >
      Prihlásiť sa
    </Link>
  );
}

/**
 * Signed-in admins get the way to the administration and to log out. Reads
 * the session (request data), so it renders behind a Suspense boundary.
 */
export async function AccountActions({ layout }: { layout: Layout }) {
  const session = await getSession();
  if (session.status !== 'authenticated') {
    return <LoginLink layout={layout} />;
  }

  return (
    <div
      className={
        layout === 'desktop'
          ? 'hidden items-center gap-1 md:flex'
          : 'flex flex-col gap-2'
      }
    >
      <Link
        href="/admin"
        className={buttonVariants({
          variant: 'secondary',
          size: layout === 'desktop' ? 'sm' : 'default',
        })}
      >
        Administrácia
      </Link>
      <form action={logout}>
        <Button
          type="submit"
          variant="ghost"
          size={layout === 'desktop' ? 'sm' : 'default'}
          className={layout === 'mobile' ? 'w-full' : undefined}
          title={`Prihlásený: ${session.user.email}`}
        >
          <LogOutIcon aria-hidden="true" />
          Odhlásiť sa
        </Button>
      </form>
    </div>
  );
}
