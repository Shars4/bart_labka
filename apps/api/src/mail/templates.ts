/**
 * Email contents. Every message has a plain-text and an HTML version built
 * from the same parts, so they cannot drift apart.
 */

export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

interface Parts {
  subject: string;
  greeting: string;
  paragraphs: string[];
  action?: { label: string; url: string };
  /** Shown under the action, e.g. how long a link is valid. */
  footnote?: string;
}

const SIGNATURE = 'Tím Útulku Labka';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function compose(parts: Parts): MailContent {
  const text = [
    parts.greeting,
    ...parts.paragraphs,
    ...(parts.action ? [`${parts.action.label}: ${parts.action.url}`] : []),
    ...(parts.footnote ? [parts.footnote] : []),
    SIGNATURE,
  ].join('\n\n');

  const paragraph = (value: string) =>
    `<p style="margin:0 0 16px">${escapeHtml(value).replaceAll('\n', '<br>')}</p>`;
  const html = [
    '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1b2a4a;max-width:560px">',
    paragraph(parts.greeting),
    ...parts.paragraphs.map(paragraph),
    parts.action
      ? `<p style="margin:24px 0"><a href="${escapeHtml(parts.action.url)}" style="background:#d9f24a;color:#1b2a4a;padding:12px 20px;border-radius:999px;font-weight:bold;text-decoration:none">${escapeHtml(parts.action.label)}</a></p>`
      : '',
    parts.footnote
      ? `<p style="margin:0 0 16px;font-size:14px;color:#5b6b86">${escapeHtml(parts.footnote)}</p>`
      : '',
    paragraph(SIGNATURE),
    '</div>',
  ].join('');

  return { subject: parts.subject, text, html };
}

export function emailVerification(input: {
  name: string;
  url: string;
}): MailContent {
  return compose({
    subject: 'Overte svoj email v Útulku Labka',
    greeting: `Dobrý deň, ${input.name},`,
    paragraphs: [
      'ďakujeme za registráciu. Aby ste sa mohli prihlásiť, overte, že tento email patrí vám.',
    ],
    action: { label: 'Overiť email', url: input.url },
    footnote:
      'Odkaz platí 24 hodín. Ak ste sa neregistrovali, tento email môžete ignorovať.',
  });
}

export function adoptionRequestReceived(input: {
  fullName: string;
  animalName: string;
  url: string;
}): MailContent {
  return compose({
    subject: `Prijali sme vašu žiadosť o adopciu: ${input.animalName}`,
    greeting: `Dobrý deň, ${input.fullName},`,
    paragraphs: [
      `ďakujeme za záujem o adopciu zvieraťa ${input.animalName}. Žiadosť sme prijali a čo najskôr sa vám ozveme.`,
      'O rozhodnutí vás budeme informovať aj emailom.',
    ],
    action: { label: 'Pozrieť zviera', url: input.url },
  });
}

export function newAdoptionRequestForAdmins(input: {
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  animalName: string;
  url: string;
}): MailContent {
  const contact = [input.email, input.phone].filter(Boolean).join(', ');
  return compose({
    subject: `Nová žiadosť o adopciu: ${input.animalName}`,
    greeting: 'Dobrý deň,',
    paragraphs: [
      `${input.fullName} (${contact}) posiela žiadosť o adopciu zvieraťa ${input.animalName}:`,
      input.message,
    ],
    action: { label: 'Vybaviť žiadosť', url: input.url },
  });
}

export function adoptionRequestResolved(input: {
  fullName: string;
  animalName: string;
  approved: boolean;
  action?: { label: string; url: string };
}): MailContent {
  return input.approved
    ? compose({
        subject: `Vaša žiadosť o adopciu bola schválená: ${input.animalName}`,
        greeting: `Dobrý deň, ${input.fullName},`,
        paragraphs: [
          `máme radosť: vašu žiadosť o adopciu zvieraťa ${input.animalName} sme schválili.`,
          'V najbližších dňoch sa vám ozveme a dohodneme, kedy si môžete prísť po nového člena rodiny.',
        ],
        action: input.action,
      })
    : compose({
        subject: `Vaša žiadosť o adopciu: ${input.animalName}`,
        greeting: `Dobrý deň, ${input.fullName},`,
        paragraphs: [
          `ďakujeme za záujem o adopciu zvieraťa ${input.animalName}. Tentoraz sme sa, žiaľ, rozhodli pre iného záujemcu.`,
          'V útulku čaká mnoho ďalších zvierat, ktoré hľadajú domov. Budeme radi, ak sa na ne pozriete.',
        ],
        action: input.action,
      });
}
