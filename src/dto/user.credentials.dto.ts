// src/user/dto/update-credentials.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateCredentialsDto {
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  newEmail: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}