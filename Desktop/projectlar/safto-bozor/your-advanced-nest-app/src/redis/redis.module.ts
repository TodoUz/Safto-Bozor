import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { redisClientFactory } from './redis.provider';

@Global() // Global modul sifatida belgilash
@Module({
  providers: [
    redisClientFactory, // Redis klienti provayderi
    RedisService, // Redis servis
  ],
  exports: [RedisService], // RedisService ni boshqa modullarga eksport qilish
})
export class RedisModule {}
