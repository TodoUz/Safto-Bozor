import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { Sale } from './entities/sale.entity';
import { StockModule } from '../stock/stock.module'; // StockModule ni import qilish
import { DebtorsModule } from '../debtors/debtors.module'; // DebtorsModule ni import qilish
import { MarketsModule } from '../markets/markets.module'; // MarketsModule ni import qilish
import { ActivityLogModule } from '../activity-log/activity-log.module'; // ActivityLogModule ni import qilish
import { EventsModule } from '../websockets/events.module'; // EventsModule ni import qilish

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale]),
    StockModule, // StockService ga kirish uchun
    DebtorsModule, // DebtorsService ga kirish uchun
    MarketsModule, // MarketsService ga kirish uchun
    ActivityLogModule, // ActivityLogService ga kirish uchun
    EventsModule, // EventsModule ni qo'shish
  ],
  providers: [SalesService],
  controllers: [SalesController],
  exports: [SalesService, TypeOrmModule],
})
export class SalesModule {}
