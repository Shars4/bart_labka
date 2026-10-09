import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MAIL_TRANSPORT, smtpTransportFactory } from './mail-transport.js';
import { MailService } from './mail.service.js';

@Global()
@Module({
  providers: [
    MailService,
    {
      provide: MAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: smtpTransportFactory,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
