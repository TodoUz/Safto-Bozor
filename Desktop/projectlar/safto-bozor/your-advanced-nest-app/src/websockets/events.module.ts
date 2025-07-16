import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RedisModule } from '../redis/redis.module'; // Redis modulini import qilish

@Module({
  imports: [RedisModule], // Redis modulini import qilish
  providers: [EventsGateway],
  exports: [EventsGateway], // Boshqa modullardan foydalanish uchun eksport qilish
})
export class EventsModule {}
