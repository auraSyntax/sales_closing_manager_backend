import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserDto } from 'src/dto/user.dto';
import { User } from 'src/entity/user';

@Injectable()
export class UserConverter {
  constructor(private readonly configService: ConfigService) {}

  convert(user: User): UserDto {
    const baseUrl = this.configService.get<string>('CLOUDINARY_BASE_URL');

    return {
      id: user.id,
      fullName: user.fullName,
      companyName: user.companyName,
      email: user.email,
      phoneNo: user.phoneNo,
      logo: user.logo ? baseUrl + user.logo : '',
      sirenNumber: user.sirenNumber,
      legalName: user.legalName,
      address: user.address,
      nafCode: user.nafCode,
      legalStatus: user.legalStatus,
      workForceSize: user.workForceSize,
      password: user.password,
      userType: user.userType,
      adminId: user.adminId,
    };
  }
}
