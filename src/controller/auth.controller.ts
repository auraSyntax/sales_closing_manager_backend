import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { AuthRequestDto } from 'src/dto/auth-request.dto';
import { AuthResponseDto } from 'src/dto/auth.response.dto';
import { ForgotPasswordDto } from 'src/dto/forgot-password.dto';
import { RefreshTokenRequestDto } from 'src/dto/refresh.token.request.dto';
import { ResetPasswordDto } from 'src/dto/reset-password.dto';
import { AuthService } from 'src/service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  login(@Body() authRequestDto: AuthRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(authRequestDto);
  }

  @Post('refresh-token')
  refreshToken(@Body() refreshTokenRequestDto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenRequestDto.refreshToken);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.handleForgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

}
