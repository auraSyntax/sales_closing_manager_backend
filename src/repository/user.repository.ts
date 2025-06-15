import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { UserResponseDto } from '../dto/user.response.dto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super(userRepo.target, userRepo.manager, userRepo.queryRunner); 
  }

  async getAllUsers( 
    page: number,
    size: number,
    branchId: string,
  ): Promise<{ data: UserResponseDto[]; total: number }> {
    const offset = (page - 1) * size;

    const query = this.userRepo
      .createQueryBuilder('u')
      .select([
        'u.id',
        'u.logo',
        'u.companyName',
        'u.companyEmail',
        'u.contactPerson',
        'u.contactPhone',
        'u.status',
      ])
      .where('u.companyName = :branchId', { branchId })
      .skip(offset)
      .take(size);

    const [rawResults, total] = await Promise.all([
      query.getRawMany(),
      this.userRepo.createQueryBuilder('u')
        .where('u.branchId = :branchId', { branchId })
        .getCount(),
    ]);

    const data = rawResults.map(
      (row) =>
        new UserResponseDto(
          row.u_id,
          row.u_logo,
          row.u_companyName,     
          row.u_companyEmail,  
          row.u_contactPerson,
          row.u_contactPhone, 
          row.u_status,
        ),
    );

    return { data, total };
  }
}