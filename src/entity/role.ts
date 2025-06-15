import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_name' })
  roleName: string;

  @Column({ default: true ,name:'is_active'})
  isActive: boolean;

  @Column({name:'admin_id' })
  adminId: string;
}
