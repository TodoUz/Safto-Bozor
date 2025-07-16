import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // 'CREATE_SALE', 'UPDATE_STOCK', 'LOGIN'

  @Column({ nullable: true })
  entityType: string; // 'Sale', 'Stock', 'User', 'Debtor'

  @Column({ nullable: true })
  entityId: string; // Ta'sir qilingan entitiyning IDsi

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Qo'shimcha ma'lumotlar (masalan, o'zgarishlar)

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.createdActivityLogs, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;
}
