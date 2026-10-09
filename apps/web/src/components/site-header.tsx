import { Suspense } from 'react';
import { AccountActions, LoginLink } from '@/components/account-actions';
import { BrandLink } from '@/components/brand';
import { DesktopNav, MobileNav } from '@/components/site-nav';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="page-container flex h-16 items-center justify-between gap-4">
        <BrandLink />
        <DesktopNav />
        <div className="flex items-center gap-1">
          {/* The session is request data: the static shell shows the login
              link, signed-in admins get their actions streamed in. */}
          <Suspense fallback={<LoginLink layout="desktop" />}>
            <AccountActions layout="desktop" />
          </Suspense>
          <MobileNav>
            <Suspense fallback={<LoginLink layout="mobile" />}>
              <AccountActions layout="mobile" />
            </Suspense>
          </MobileNav>
        </div>
      </div>
    </header>
  );
}
