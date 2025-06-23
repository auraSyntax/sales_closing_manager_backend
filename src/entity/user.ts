import { UserType } from 'src/enums/user_type.enum';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'phone_no' })
  phoneNo: string;

  @CreateDateColumn({ type: 'timestamp', name: 'registered_date_time' })
  registeredDateTime: Date;

  @Column()
  password: string;

  @Column({ name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'admin_id' })
  adminId: string;

  @Column({ name: 'logo' })
  logo: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.ADMIN,
    name: 'user_type'
  })
  userType: UserType;

  @Column({ name: 'siren_no' })
  sirenNumber: string;

  @Column({ name: 'legal_name' })
  legalName: string;

  @Column({ name: 'address' })
  address: string;

  @Column({ name: 'naf_code' })
  nafCode: string;

  @Column({ name: 'legal_status' })
  legalStatus: string;

  @Column({ name: 'work_force_size' })
  workForceSize: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Column({ name: 'is_first_login' })
  isFirstLogin: boolean;

  @Column({name: 'reset_token_expires', nullable: true })
  resetTokenExpires: Date;
}