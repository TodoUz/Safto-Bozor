import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Stock } from '../../stock/entities/stock.entity';
import { Market } from '../../markets/entities/market.entity';
import { Debtor } from '../../debtors/entities/debtor.entity';
import { ActivityLog } from '../../activity-log/entities/activity-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'user' }) // 'admin', 'manager', 'user'
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Sale, (sale) => sale.createdBy)
  createdSales: Sale[];

  @OneToMany(() => Sale, (sale) => sale.updatedBy)
  updatedSales: Sale[];

  @OneToMany(() => Stock, (stock) => stock.createdBy)
  createdStocks: Stock[];

  @OneToMany(() => Stock, (stock) => stock.updatedBy)
  updatedStocks: Stock[];

  @OneToMany(() => Market, (market) => market.createdBy)
  createdMarkets: Market[];

  @OneToMany(() => Market, (market) => market.updatedBy)
  updatedMarkets: Market[];

  @OneToMany(() => Debtor, (debtor) => debtor.createdBy)
  createdDebtors: Debtor[];

  @OneToMany(() => Debtor, (debtor) => debtor.updatedBy)
  updatedDebtors: Debtor[];

  @OneToMany(() => ActivityLog, (log) => log.createdBy)
  createdActivityLogs: ActivityLog[];
}
