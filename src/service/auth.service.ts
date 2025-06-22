import { BadRequestException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
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
import { ServiceException } from 'src/exception/service-exception';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService
  ) { }

  async login(authRequestDto: AuthRequestDto): Promise<AuthResponseDto> {
    const { email, password, rememberMe } = authRequestDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new ServiceException('User not found!', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ServiceException('Invalid credentials!', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const jwtExpiry = rememberMe ? '30d' : '15m';
    const refreshExpiry = rememberMe ? '31d' : '7d';

    const jwtToken = await this.jwtService.signAsync(payload, {
      expiresIn: jwtExpiry,
    });

    // Add rememberMe to refresh token payload only if true
    const refreshPayload = rememberMe ? { ...payload, rememberMe: true } : payload;

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: refreshExpiry,
    });

    const response = new AuthResponseDto();
    response.jwtToken = jwtToken;
    response.refreshToken = refreshToken;
    response.userName = authRequestDto.email;
    response.expirationTime = jwtExpiry;

    return response;
  }

async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
  try {
    const payload = await this.jwtService.verifyAsync(refreshToken);

    // Extract rememberMe flag if present
    const rememberMe = payload.rememberMe === true;

    const newPayload = {
      sub: payload.sub,
      email: payload.email,
      userType: payload.userType,
    };

    const jwtExpiry = rememberMe ? '30d' : '15m';
    const refreshExpiry = rememberMe ? '31d' : '7d';

    const newJwtToken = await this.jwtService.signAsync(newPayload, {
      expiresIn: jwtExpiry,
    });

    // Add rememberMe to refresh token payload only if true
    const refreshPayload = rememberMe ? { ...newPayload, rememberMe: true } : newPayload;

    const newRefreshToken = await this.jwtService.signAsync(refreshPayload, {
      expiresIn: refreshExpiry,
    });

    const response = new AuthResponseDto();
    response.jwtToken = newJwtToken;
    response.refreshToken = newRefreshToken;
    response.expirationTime = jwtExpiry;
    response.userName = payload.email; // 👈 add email here to response

    return response;
  } catch (err) {
    throw new ServiceException('Invalid or expired refresh token!', 'Unauthorized', HttpStatus.UNAUTHORIZED);
  }
}

  async handleForgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new ServiceException('User not found with provided email!', 'Bad Request', HttpStatus.BAD_REQUEST);
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

    return { message: 'Password reset email sent successfully!' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { resetToken, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({ where: { resetToken: resetToken } });
    if (!user) {
      throw new ServiceException('Invalid or expired reset token!', 'Bad Request', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetToken = "";

    await this.userRepository.save(user);

    return { message: 'Password successfully updated!' };
  }
}
