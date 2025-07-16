import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Debtor } from '../../debtors/entities/debtor.entity';
import { Market } from '../../markets/entities/market.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  productsSold: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalItemAmount: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debtAmount: number;

  @Column({ default: 'cash' }) // 'cash', 'card', 'debt'
  paymentMethod: string;

  @Column({ default: false })
  isReturned: boolean;

  @CreateDateColumn()
  saleDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdSales, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedSales, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @ManyToOne(() => Debtor, (debtor) => debtor.sales, { nullable: true })
  @JoinColumn({ name: 'debtorId' })
  debtor: Debtor;

  @Column({ nullable: true })
  debtorId: string;

  @ManyToOne(() => Market, (market) => market.sales, { nullable: true })
  @JoinColumn({ name: 'marketId' })
  market: Market;

  @Column({ nullable: true })
  marketId: string;
}
