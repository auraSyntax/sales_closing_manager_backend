import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserConverter } from 'src/converter/user.converter';
import { PaginatedResponseDto } from 'src/dto/paginated.response.dto';
import { ResponseDto } from 'src/dto/response.dto';
import { UserDto } from 'src/dto/user.dto';
import { UserResponseDto } from 'src/dto/user.response.dto';
import { User } from 'src/entity/user';
import { UserType } from 'src/enums/user_type.enum';
import { UserRepository } from 'src/repository/user.repository';
import { Repository } from 'typeorm';
import { EmailService } from './mail.service';
import { EmailDataDto } from 'src/dto/email-data.dto';
import * as bcrypt from 'bcrypt';
import { UpdateCredentialsDto } from 'src/dto/user.credentials.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly userConverter: UserConverter,
    private readonly mailService: EmailService,
  ) { }


async createUser(dto: UserDto): Promise<ResponseDto> {
    await this.validateEmailUniqueness(dto.email, dto.id);

    const user = await this.convert(dto);
    await this.userRepository.save(user);

     await this.mailService.sendMail(
      dto.email,
      'Welcome to our platform',
      `Hello ${dto.fullName}, welcome to our service!`,
      `<p>Hello <strong>${dto.fullName}</strong>, welcome to our service!</p>`
    );
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
      throw new Error('EMAIL_ALREADY_EXISTS');
    }
  }

  private async convert(dto: UserDto): Promise<User> {
    if (dto.id) {
      const existing = await this.userRepository.findOneBy({ id: dto.id });
      if (!existing) throw new Error('USER_NOT_FOUND');

      existing.fullName = dto.fullName;
      existing.companyName = dto.companyName;
      existing.email = dto.email;
      existing.phoneNo = dto.phoneNo;
      
      if (dto.password) {
        existing.password = await this.hashPassword(dto.password);
      }
      
      existing.adminId = dto.adminId;
      existing.isActive = dto.isActive ?? true;
      existing.logo = dto.logo;
      existing.userType = dto.userType ?? UserType.ADMIN;

      return existing;
    }

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
    search: string,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
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
      .where('u.companyName LIKE :search', { search: likeSearch })
      .skip(offset)
      .take(size);

    const [rawResults, total] = await Promise.all([
      query.getRawMany(),
      this.userRepository
        .createQueryBuilder('u')
        .where('u.companyName LIKE :search', { search: likeSearch })
        .getCount(),
    ]);

    const data = rawResults.map((row) =>
      new UserResponseDto(
        row.u_id,
        row.u_logo,
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
      throw new NotFoundException('User not found');
    }

    return this.userConverter.convert(user);
  }

  async deleteUser(id: string): Promise<ResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException();

    await this.userRepository.delete(user.id);
    return new ResponseDto("User deleted")
  }

  async updateUserStatus(id: string, status: boolean): Promise<ResponseDto> {
    const result = await this.userRepository.update(id, { isActive: status });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new ResponseDto("User status updated successfully");
  }

  async updateUserCredentials(dto: UpdateCredentialsDto): Promise<ResponseDto> {
  const user = await this.userRepository.findOneBy({ id: dto.userId });
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('INVALID_CURRENT_PASSWORD');
  }

  await this.validateEmailUniqueness(dto.newEmail, dto.userId);

  user.email = dto.newEmail;
  user.password = await this.hashPassword(dto.newPassword);

  await this.userRepository.save(user);

  return new ResponseDto('CREDENTIALS_UPDATED_SUCCESSFULLY');
}
}


