import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';
import type { EnvironmentVariables } from '../config/env.validation.js';

export interface MailMessage {
  to: string[];
  subject: string;
  text: string;
  html: string;
}

/** Delivers composed messages; the e2e tests replace it with an outbox. */
export interface MailTransport {
  send(message: MailMessage & { from: string }): Promise<void>;
}

export const MAIL_TRANSPORT = Symbol('MAIL_TRANSPORT');

/** Plain SMTP without authentication, as Mailpit in docker compose expects. */
export function smtpTransportFactory(
  config: ConfigService<EnvironmentVariables, true>,
): MailTransport {
  const transporter = createTransport({
    host: config.get('SMTP_HOST', { infer: true }),
    port: config.get('SMTP_PORT', { infer: true }),
    secure: false,
    // Fail fast instead of nodemailer's two-minute default when the SMTP
    // server is down.
    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 10_000,
  });

  return {
    async send(message) {
      await transporter.sendMail(message);
    },
  };
}
