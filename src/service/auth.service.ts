import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid'; // ✅ proper uuid import
import { User } from 'src/entity/user';
import { AuthRequestDto } from 'src/dto/auth-request.dto';
import { AuthResponseDto } from 'src/dto/auth.response.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from './mail.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) {}

  async login(authRequestDto: AuthRequestDto): Promise<AuthResponseDto> {
    const { email, password } = authRequestDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    const jwtToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const response = new AuthResponseDto();
    response.jwtToken = jwtToken;
    response.refreshToken = refreshToken;

    return response;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const newPayload = { sub: payload.sub, email: payload.email };

      const newJwtToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '7d',
      });

      const response = new AuthResponseDto();
      response.jwtToken = newJwtToken;
      response.refreshToken = newRefreshToken;

      return response;
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

async handleForgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found with provided email');
    }

    const resetToken = uuidv4();
    user.resetToken = resetToken;
    await this.userRepository.save(user);

    // Build reset link
    const resetLink = `https://yourdomain.com/reset-password?token=${resetToken}`;

    // Prepare email context
    const context = {
      USER_NAME: user.fullName,  // assuming your user has fullName property
      RESET_LINK: resetLink,
    };

    // Send email
    await this.emailService.sendMail(
      user.email,
      'Reset Your Password',
      context,
      'reset-password-template'  
    );

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({ where: { resetToken: resetToken } });
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = "";

    await this.userRepository.save(user);

    return { message: 'Password successfully updated' };
  }
}
