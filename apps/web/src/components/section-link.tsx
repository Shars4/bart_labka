'use client';

import Link from 'next/link';
import type { ComponentProps, MouseEvent } from 'react';

type SectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  /** Section on a page: "/#ako-adoptovat", or "#ako-adoptovat" for this page. */
  href: `${string}#${string}`;
};

/**
 * Link to a section of a page. Next.js scrolls to a hash only when the hash
 * changes, so clicking the same link again would do nothing. When the
 * section is on the current page, this scrolls to it on every click (smoothly,
 * see globals.css) and moves focus there, like a native anchor. Links to
 * another page navigate as usual.
 */
export function SectionLink({ href, onClick, ...props }: SectionLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const [path, id] = href.split('#');
    const target = document.getElementById(id);
    if ((path !== '' && path !== window.location.pathname) || !target) {
      return;
    }

    event.preventDefault();
    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`);
    }
    target.scrollIntoView({ block: 'start' });
    target.focus({ preventScroll: true });
  }

  return <Link {...props} href={href} onClick={handleClick} />;
}
