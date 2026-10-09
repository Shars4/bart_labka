/**
 * Confirmations passed in the URL after a Server Action redirects, e.g.
 * /admin?oznam=ulozene&meno=Bella. Shown once by <FlashToast />.
 */
const NOTICES: Record<string, (name: string) => string> = {
  pridane: (name) => `Pridané: ${name}`,
  ulozene: (name) => `Uložené: ${name}`,
};

/** Reads the notice from the page's search params. */
export function noticeFromParams(
  params: Record<string, string | string[] | undefined>,
): string | null {
  const notice = typeof params.oznam === 'string' ? params.oznam : null;
  const name = typeof params.meno === 'string' ? params.meno.slice(0, 50) : '';
  return notice && NOTICES[notice] ? NOTICES[notice](name) : null;
}
