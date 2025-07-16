import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { Market } from './entities/market.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Market]), ActivityLogModule],
  providers: [MarketsService],
  controllers: [MarketsController],
  exports: [MarketsService, TypeOrmModule], // SalesModule ga eksport qilish
})
export class MarketsModule {}
