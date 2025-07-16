import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { User } from '../../users/entities/user.entity';

@Entity('debtors')
export class Debtor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  contactInfo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentDebtAmount: number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  debtItems: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalItemAmount: number;
    saleId: string;
    debtDate?: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdDebtors, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedDebtors, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @OneToMany(() => Sale, (sale) => sale.debtor)
  sales: Sale[];
}
