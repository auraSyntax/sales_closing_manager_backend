import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"No Reply" <${this.configService.get<string>('MAIL_USERNAME')}>`,
      to,
      subject,
      text,
      html: html || text,
    });
  }
}