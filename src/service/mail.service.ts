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
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USERNAME'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async sendMail(
    to: string,
    subject: string,
    context: any,
    templateName: string,
  ): Promise<void> {
    // Compile the template first
    const html = this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      from: '"No Reply" <your.email@example.com>',
      to,
      subject,
      text: `Hello ${context.fullName}, welcome to our service!`,
      html,
    });
  }
  private renderTemplate(templateName: string, context: any): string {
    // Corrected path
    const templatePath = path.resolve(process.cwd(), 'src', 'templates', `${templateName}.html`);

    if (!fs.existsSync(templatePath)) {
      console.error(`Template not found at: ${templatePath}`);
      throw new Error('Email template not found');
    }

    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return handlebars.compile(templateSource)(context);
  }


}

