import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { getSession } from '@/lib/auth';

/** Shortcut to the admin form, shown on public pages to signed-in admins only. */
export async function AdminEditLink({ animalId }: { animalId: number }) {
  const session = await getSession();
  if (session.status !== 'authenticated') {
    return null;
  }
  return (
    <Link
      href={`/admin/zvierata/${animalId}/upravit`}
      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
    >
      <PencilIcon aria-hidden="true" />
      Upraviť
    </Link>
  );
}
