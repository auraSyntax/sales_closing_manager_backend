import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailPort = this.configService.get<number>('MAIL_PORT');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: mailPort,
      secure: false, // MUST be false for port 587 (STARTTLS)
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      requireTLS: true,
    });

    // Optional: Verify SMTP connection at startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection failed:', error);
      } else {
        console.log('SMTP server is ready to take messages');
      }
    });
  }

  async sendMail(
    to: string,
    subject: string,
    context: any,
    templateName: string,
  ): Promise<void> {
    const html = this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      from: `"${this.configService.get<string>('MAIL_FROM_NAME')}" <${this.configService.get<string>('MAIL_FROM_EMAIL')}>`,
      to,
      subject,
      text: `Hello ${context.fullName}, welcome to our service!`,
      html,
    });
  }

  private renderTemplate(templateName: string, context: any): string {
    const templatePath = path.resolve(
      process.cwd(),
      'src',
      'templates',
      `${templateName}.html`,
    );

    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found at: ${templatePath}`);
      throw new Error('Email template not found');
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);
    return template(context);
  }
}
