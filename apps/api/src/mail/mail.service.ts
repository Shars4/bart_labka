import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { MAIL_TRANSPORT, type MailTransport } from './mail-transport.js';
import * as templates from './templates.js';

interface RequestForMail {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  animal: { id: number; name: string };
}

/**
 * Sends the application's emails. Delivery is best effort: a failure is
 * logged and never fails the request that triggered it, so a down SMTP
 * server cannot block registrations or adoption requests. A production
 * setup would queue messages in an outbox table and retry.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly from: string;
  private readonly webUrl: string;

  constructor(
    @Inject(MAIL_TRANSPORT) private readonly transport: MailTransport,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.from = config.get('MAIL_FROM', { infer: true });
    this.webUrl = config.get('WEB_URL', { infer: true });
  }

  sendEmailVerification(user: { name: string; email: string }, token: string) {
    const url = `${this.webUrl}/overenie-emailu?token=${encodeURIComponent(token)}`;
    return this.send(
      [user.email],
      templates.emailVerification({ ...user, url }),
    );
  }

  sendAdoptionRequestReceived(request: RequestForMail) {
    return this.send(
      [request.email],
      templates.adoptionRequestReceived({
        fullName: request.fullName,
        animalName: request.animal.name,
        url: `${this.webUrl}/zvierata/${request.animal.id}`,
      }),
    );
  }

  sendNewAdoptionRequestToAdmins(
    request: RequestForMail,
    adminEmails: string[],
  ) {
    if (adminEmails.length === 0) {
      return Promise.resolve();
    }
    return this.send(
      adminEmails,
      templates.newAdoptionRequestForAdmins({
        ...request,
        animalName: request.animal.name,
        url: `${this.webUrl}/admin/ziadosti`,
      }),
    );
  }

  /** `hasAccount`: the applicant can follow the request under "Moje žiadosti". */
  sendAdoptionRequestResolved(
    request: Pick<RequestForMail, 'fullName' | 'email' | 'animal'>,
    approved: boolean,
    hasAccount: boolean,
  ) {
    const action = hasAccount
      ? { label: 'Moje žiadosti', url: `${this.webUrl}/moje-ziadosti` }
      : approved
        ? undefined
        : { label: 'Zvieratá na adopciu', url: `${this.webUrl}/zvierata` };
    return this.send(
      [request.email],
      templates.adoptionRequestResolved({
        fullName: request.fullName,
        animalName: request.animal.name,
        approved,
        action,
      }),
    );
  }

  private async send(
    to: string[],
    content: templates.MailContent,
  ): Promise<void> {
    try {
      await this.transport.send({ from: this.from, to, ...content });
    } catch (error) {
      this.logger.error(
        `Email "${content.subject}" could not be sent`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
