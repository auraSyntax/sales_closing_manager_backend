import { Module } from '@nestjs/common';
import { EmailService } from '../src/service/mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class MailModule {}
