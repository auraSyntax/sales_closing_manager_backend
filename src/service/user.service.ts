import { HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserConverter } from 'src/converter/user.converter';
import { PaginatedResponseDto } from 'src/dto/paginated.response.dto';
import { ResponseDto } from 'src/dto/response.dto';
import { UserDto } from 'src/dto/user.dto';
import { UserResponseDto } from 'src/dto/user.response.dto';
import { User } from 'src/entity/user';
import { UserType } from 'src/enums/user_type.enum';
import { Brackets, Repository } from 'typeorm';
import { EmailService } from './mail.service';
import { EmailDataDto } from 'src/dto/email-data.dto';
import * as bcrypt from 'bcrypt';
import { UpdateCredentialsDto } from 'src/dto/user.credentials.dto';
import { CurrentUserDetailsDto } from 'src/dto/current-user-details.dto';
import { TokenService } from './token.service';
import { ServiceException } from 'src/exception/service-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userConverter: UserConverter,
    private readonly mailService: EmailService,
    private readonly tokenService: TokenService
  ) { }

  async createUser(dto: UserDto, request: Request): Promise<ResponseDto> {
    await this.validateEmailUniqueness(dto.email, dto.id);

    const isNewUser = !dto.id;
    const user = await this.convert(dto);

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }
    const token = authHeader.replace('Bearer ', '');
    const tokenInfo = TokenService.getTokenInfo(token);
    const adminId = tokenInfo.sub; // assuming sub holds adminId

    await this.userRepository.save(user);

    if (isNewUser) {
      const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

      // Set token and expiration (1 year from now)
      user.resetToken = resetToken;
      user.resetTokenExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days in ms
      user.isFirstLogin = true;
      await this.userRepository.save(user);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetLink = `${frontendUrl}/new-password?token=${resetToken}`;

      await this.mailService.sendMail(
        dto.email,
        'Your Account Has Been Created',
        {
          EMAIL: dto.email,
          USER_NAME: dto.fullName,
          TEMP_PASSWORD: dto.password,
          RESET_LINK: resetLink,
        },
        'account-creation-template'
      );
    }

    return new ResponseDto('USER_SAVED');
  }

  private async validateEmailUniqueness(email: string, userId?: string): Promise<void> {
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (userId) {
      query.andWhere('user.id != :userId', { userId });
    }

    const existingUser = await query.getOne();

    if (existingUser) {
      throw new ServiceException('Email already exists', 'Bad request', HttpStatus.BAD_REQUEST);
    }
  }

  private async convert(dto: UserDto): Promise<User> {
    if (dto.id) {
      const existing = await this.userRepository.findOneBy({ id: dto.id });
      if (!existing) {
        throw new ServiceException('User not found', 'Bad request', HttpStatus.BAD_REQUEST);
      }

      existing.fullName = dto.fullName;
      existing.companyName = dto.companyName;
      existing.phoneNo = dto.phoneNo;
      existing.adminId = dto.adminId;
      existing.isActive = dto.isActive ?? true;
      existing.logo = dto.logo;
      existing.userType = dto.userType ?? UserType.ADMIN;
      existing.sirenNumber = dto.sirenNumber
      existing.legalName = dto.legalName
      existing.address = dto.address
      existing.nafCode = dto.nafCode
      existing.legalStatus = dto.legalStatus
      existing.workForceSize = dto.workForceSize

      return existing;
    }

    // For new users, hash password and include email
    const hashedPassword = await this.hashPassword(dto.password);

    return this.userRepository.create({
      ...dto,
      password: hashedPassword,
      isActive: dto.isActive ?? true,
      userType: dto.userType ?? UserType.ADMIN,
    });
  }


  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async getAllUsers(
    page: number,
    size: number,
    search: string, request: Request
  ): Promise<PaginatedResponseDto<UserResponseDto>> {

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const tokenInfo = TokenService.getTokenInfo(token);
    const adminId = tokenInfo.sub;

    const offset = (page - 1) * size;
    const likeSearch = search ? `%${search}%` : '%%';

    const query = this.userRepository
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.logo',
        'u.companyName',
        'u.email',
        'u.fullName',
        'u.phoneNo',
        'u.isActive',
      ])
      .where(
        new Brackets((qb) => {
          qb.where('u.companyName LIKE :search')
            .orWhere('u.email LIKE :search')
            .orWhere('u.fullName LIKE :search');
        }),
      )
      .andWhere('u.userType = :userType')
      .andWhere('u.adminId = :adminId') // ✅ add this here
      .setParameters({ search: likeSearch, userType: 'ADMIN', adminId })
      .skip(offset)
      .take(size);


    const [rawResults, total] = await Promise.all([
      query.getRawMany(),
      this.userRepository
        .createQueryBuilder('u')
        .where(
          new Brackets((qb) => {
            qb.where('u.companyName LIKE :search')
              .orWhere('u.email LIKE :search')
              .orWhere('u.fullName LIKE :search');
          }),
        )
        .andWhere('u.userType = :userType', { search: likeSearch, userType: 'ADMIN' })
        .andWhere('u.adminId = :adminId', { adminId })
        .getCount(),
    ]);

    const baseUrl = this.configService.get<string>('CLOUDINARY_BASE_URL');

    const data = rawResults.map((row) =>
      new UserResponseDto(
        row.u_id,
        row.u_logo ? baseUrl + row.u_logo : null,
        row.u_company_name,
        row.u_email,
        row.u_full_name,
        row.u_phone_no,
        row.u_is_active,
      ),
    );

    const totalPages = Math.ceil(total / size);

    const paginatedResponseDto = new PaginatedResponseDto<UserResponseDto>();
    paginatedResponseDto.data = data;
    paginatedResponseDto.currentPage = page;
    paginatedResponseDto.totalPages = totalPages;
    paginatedResponseDto.totalItems = total;

    return paginatedResponseDto;
  }

  async getUserById(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new ServiceException('User not found', 'Bad request', HttpStatus.BAD_REQUEST);
    }

    return this.userConverter.convert(user);
  }

  async deleteUser(id: string): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new ServiceException('User not found', 'Bad request', HttpStatus.BAD_REQUEST);

    await this.userRepository.delete(user.id);
    return new ResponseDto("User deleted")
  }

  async updateUserStatus(id: string, status: boolean): Promise<ResponseDto> {
    const result = await this.userRepository.update(id, { isActive: status });

    if (result.affected === 0) {
      throw new ServiceException('User not found', 'Bad request', HttpStatus.BAD_REQUEST)
    }

    return new ResponseDto("User status updated successfully");
  }

  async updateUserCredentials(dto: UpdateCredentialsDto): Promise<ResponseDto> {
    const user = await this.userRepository.findOneBy({ id: dto.userId });
    if (!user) {
      throw new ServiceException('User not found', 'Bad request', HttpStatus.BAD_REQUEST);
    }

    await this.validateEmailUniqueness(dto.newEmail, dto.userId);

    user.email = dto.newEmail;
    user.password = await this.hashPassword(dto.newPassword);

    // Generate a reset token and expiry
    const resetToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    user.isFirstLogin = true;

    await this.userRepository.save(user);

    // Send credentials email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const resetLink = `${frontendUrl}/new-password?token=${resetToken}`;

    await this.mailService.sendMail(
      user.email,
      'Your Credentials Have Been Updated',
      {
        USER_NAME: user.fullName,
        USER_EMAIL: user.email,
        TEMP_PASSWORD: dto.newPassword,
        RESET_LINK: resetLink,
      },
      'credentials-update-confirmation-template'
    );

    return new ResponseDto('CREDENTIALS_UPDATED_SUCCESSFULLY');
  }

  async getCurrentUserDetails(request: Request): Promise<CurrentUserDetailsDto> {
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const tokenInfo = TokenService.getTokenInfo(token);
    const adminId = tokenInfo.sub; // assuming sub holds adminId

    console.log('Extracted adminId:', adminId);

    if (!adminId) {
      throw new UnauthorizedException('Invalid token - adminId not found');
    }

    const result = await this.userRepository
      .createQueryBuilder('u')
      .select('u.fullName', 'fullName')
      .addSelect('u.logo', 'profile')
      .addSelect('u.userType', 'userType')
      .addSelect('COUNT(u.id)', 'totalCount')
      .addSelect(`SUM(CASE WHEN u.isActive = true THEN 1 ELSE 0 END)`, 'activeCount')
      .where('u.id = :adminId', { adminId })
      .groupBy('u.fullName')
      .addGroupBy('u.logo')
      .getRawOne();

    console.log('Query result:', result);

    if (!result) {
      throw new ServiceException('No user found for the given adminId', 'Bad request', HttpStatus.BAD_REQUEST);
    }

    // Get base URL from config service
    const baseUrl = this.configService.get<string>('CLOUDINARY_BASE_URL');

    return {
      userName: result.fullName,
      profile: result.profile ? baseUrl + result.profile : null,
      totalCompanies: parseInt(result.totalCount, 10),
      activeCompanies: parseInt(result.activeCount, 10),
      userType: result.userType === 'SUPER_ADMIN' ? 'SUPER ADMIN' : result.userType,
    };
  }
}

function uuidv4() {
  throw new Error('Function not implemented.');
}

