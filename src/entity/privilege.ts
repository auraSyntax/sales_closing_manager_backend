import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('privilege')
export class Priviledge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'privilege' })
  privilege: string;
}
