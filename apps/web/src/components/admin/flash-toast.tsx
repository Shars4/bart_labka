'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Shows a confirmation that arrived in the URL after a redirect (e.g.
 * ?oznam=ulozene&meno=Bella) and then removes it from the URL, so a reload
 * or the back button does not show it again.
 */
export function FlashToast({ message }: { message: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef<string | null>(null);

  useEffect(() => {
    if (!message || shown.current === message) {
      return;
    }
    shown.current = message;
    toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);

  return null;
}
