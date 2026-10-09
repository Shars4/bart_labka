/**
 * Server-side configuration. SITE_URL and PUBLIC_API_DOCS_URL also end up in
 * the prerendered static shell (metadata base URL, footer link), so the
 * Docker build receives them as build arguments.
 */

/** Public origin of the website, used for canonical and Open Graph URLs. */
export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

/** Swagger UI as reachable from the visitor's browser. */
export const API_DOCS_URL =
  process.env.PUBLIC_API_DOCS_URL ?? 'http://localhost:4000/docs';

/**
 * Demo mailbox (Mailpit) linked next to the email verification steps. Empty
 * hides the link, e.g. in production with a real SMTP server.
 */
export const DEMO_MAILBOX_URL =
  process.env.DEMO_MAILBOX_URL ?? 'http://localhost:8025';

/** REST API as reachable from the web server (inside Docker: the api service). */
export const API_INTERNAL_URL =
  process.env.API_INTERNAL_URL ?? 'http://localhost:4000';

export const SITE_NAME = 'Útulok Labka';
