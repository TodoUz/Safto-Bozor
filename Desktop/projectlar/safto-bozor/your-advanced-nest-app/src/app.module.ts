import { Module, CacheModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SalesModule } from './sales/sales.module';
import { StockModule } from './stock/stock.module';
import { DebtorsModule } from './debtors/debtors.module';
import { MarketsModule } from './markets/markets.module';
import { ActivityLogModule } from './activity-log/activity-log.module';
import { RedisModule } from './redis/redis.module'; // Redis modulini import qilish
import { EventsModule } from './websockets/events.module'; // WebSockets modulini import qilish

// Entitilarni import qilish
import { User } from './users/entities/user.entity';
import { Sale } from './sales/entities/sale.entity';
import { Stock } from './stock/entities/stock.entity';
import { Debtor } from './debtors/entities/debtor.entity';
import { Market } from './markets/entities/market.entity';
import { ActivityLog } from './activity-log/entities/activity-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Muhit o'zgaruvchilarini global qilish
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Sale, Stock, Debtor, Market, ActivityLog], // Barcha entitilarni qo'shish
      synchronize: true, // DIQQAT: Ishlab chiqarishda false bo'lishi kerak, migratsiyalardan foydalaning!
      autoLoadEntities: true, // Entitilarni avtomatik yuklash
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
      global: true, // JWT modulini global qilish
    }),
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLE_TTL, 10), // Vaqt oralig'i (sekundlarda)
      limit: parseInt(process.env.THROTTLE_LIMIT, 10), // Ruxsat etilgan so'rovlar soni
    }),
    // Redis kesh modulini sozlash
    CacheModule.register({
      ttl: 5 * 60 * 1000, // Kesh muddati (millisekundlarda), 5 daqiqa
      max: 100, // Maksimal elementlar soni
      isGlobal: true, // Kesh modulini global qilish
    }),
    RedisModule, // Redis modulini qo'shish
    EventsModule, // WebSockets modulini qo'shish
    UsersModule,
    AuthModule,
    SalesModule,
    StockModule,
    DebtorsModule,
    MarketsModule,
    ActivityLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
