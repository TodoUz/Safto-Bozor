import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DebtorsService } from './debtors.service';
import { DebtorsController } from './debtors.controller';
import { Debtor } from './entities/debtor.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { EventsModule } from '../websockets/events.module'; // EventsModule ni import qilish

@Module({
  imports: [TypeOrmModule.forFeature([Debtor]), ActivityLogModule, EventsModule], // EventsModule ni qo'shish
  providers: [DebtorsService],
  controllers: [DebtorsController],
  exports: [DebtorsService, TypeOrmModule], // SalesModule ga eksport qilish
})
export class DebtorsModule {}
