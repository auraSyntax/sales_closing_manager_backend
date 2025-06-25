import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RolePriviledge } from './role_privilege';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_name' })
  roleName: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ name: 'admin_id' })
  adminId: string;

  @OneToMany(() => RolePriviledge, rp => rp.priviledge, { cascade: true })
  rolePriviledges: RolePriviledge[];
}
