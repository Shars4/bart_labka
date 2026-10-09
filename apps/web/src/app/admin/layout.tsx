import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/admin-nav';
import { noIndex } from '@/lib/seo';

export const metadata: Metadata = {
  title: { default: 'Administrácia', template: '%s | Administrácia' },
  ...noIndex,
};

/**
 * No session check here: proxy.ts redirects visitors without a session
 * cookie, and every admin page and action is authorized by the API itself
 * (a 401 sends the admin back to the login page).
 */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="page-container py-8 md:py-12">
      <AdminNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
