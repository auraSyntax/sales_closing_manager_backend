// src/user/dto/user-save.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserType } from 'src/enums/user_type.enum';

export class UserDto {
  @IsOptional()
  id?: string;

  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  companyName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  phoneNo: string;

  @IsNotEmpty()
  password: string;

  @IsOptional()
  isActive?: boolean;

  @IsNotEmpty()
  adminId: string;

  @IsNotEmpty()
  userType: UserType;

  @IsOptional()
  logo: string;

  @IsOptional()
  sirenNumber: string;

  @IsOptional()
  legalName: string;

  @IsOptional()
  address: string;

  @IsOptional()
  nafCode: string;

  @IsOptional()
  legalStatus: string;

  @IsOptional()
  workForceSize: string;
}
