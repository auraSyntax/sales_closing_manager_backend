import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('services')
export class Services {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_name' })
  serviceName: string;

  @Column({ default: true ,name:'is_active'})
  isActive: boolean;

  @Column({name:'admin_id' })
  adminId: string;
}
