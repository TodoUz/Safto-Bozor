import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { Stock } from './entities/stock.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { EventsModule } from '../websockets/events.module'; // EventsModule ni import qilish

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), ActivityLogModule, EventsModule], // EventsModule ni qo'shish
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService, TypeOrmModule], // StockService ni SalesModule ga eksport qilish
})
export class StockModule {}
