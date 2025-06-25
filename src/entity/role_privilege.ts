import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './role';
import { Priviledge } from './privilege';

@Entity('role_privilege')
export class RolePriviledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

 @ManyToOne(() => Role, role => role.rolePriviledges, { eager:true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Priviledge, priv => priv.rolePriviledges, { eager: true })
  @JoinColumn({ name: 'privilege_id' })
  priviledge: Priviledge;
}
