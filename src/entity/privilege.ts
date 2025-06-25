import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { RolePriviledge } from './role_privilege';

@Entity('privilege')
export class Priviledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'privilege' })
  privilege: string;

  @OneToMany(() => RolePriviledge, rp => rp.priviledge, { cascade: true})
  rolePriviledges: RolePriviledge[];
}
