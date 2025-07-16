import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from './redis.provider';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject(REDIS_CLIENT) private readonly redisClient: Redis) {}

  onModuleDestroy() {
    this.redisClient.disconnect();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  // Keshga ma'lumot yozish
  async set(key: string, value: string, ttl?: number): Promise<string> {
    if (ttl) {
      return this.redisClient.set(key, value, 'EX', ttl);
    }
    return this.redisClient.set(key, value);
  }

  // Keshdan ma'lumot o'qish
  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  // Keshdan ma'lumot o'chirish
  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  // Pub/Sub - Publish
  async publish(channel: string, message: string): Promise<number> {
    return this.redisClient.publish(channel, message);
  }

  // Pub/Sub - Subscribe (bu servisda to'g'ridan-to'g'ri ishlatilmaydi, lekin mavjud)
  // Odatda, subscribe qilish alohida joyda, masalan, WebSocket gatewayda amalga oshiriladi.
}
