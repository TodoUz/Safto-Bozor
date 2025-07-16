import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLog } from './entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
  providers: [ActivityLogService],
  controllers: [ActivityLogController],
  exports: [ActivityLogService], // Boshqa modullarga eksport qilish
})
export class ActivityLogModule {}
