import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

import { User } from '@/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendForgotPasswordEmail(user: User, resetToken: string) {
    const url = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset your Reactive Resume password',
      template: 'forgot-password',
      context: {
        name: user.firstName,
        url,
      },
    });
  }
}
