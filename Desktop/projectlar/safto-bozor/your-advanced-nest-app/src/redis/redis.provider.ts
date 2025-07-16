import { Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from 'dotenv';

config(); // .env faylini yuklash

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisClientFactory: Provider<Redis> = {
  provide: REDIS_CLIENT,
  useFactory: () => {
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redis.on('error', (err) => {
      console.error('Redis xatosi:', err);
    });

    redis.on('connect', () => {
      console.log('Redisga muvaffaqiyatli ulandi!');
    });

    return redis;
  },
};
