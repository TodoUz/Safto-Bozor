#!/bin/bash

# Loyiha nomini aniqlash
PROJECT_NAME="your-advanced-nest-app"

echo "=================================================="
echo " NestJS Advanced Backend Loyihasini O'rnatish Skripti"
echo "=================================================="
echo ""

# 1. Loyiha papkasini yaratish va unga kirish
echo "1. '$PROJECT_NAME' loyiha papkasini yaratilmoqda..."
# --strict: TypeScript qat'iy rejimini yoqadi
# --package-manager npm: npm dan foydalanishni belgilaydi
# --skip-git: Git repozitoriyasini avtomatik yaratishni o'chiradi
nest new $PROJECT_NAME --strict --package-manager npm --skip-git || { echo "NestJS loyihasini yaratishda xato yuz berdi."; exit 1; }
cd $PROJECT_NAME || { echo "Loyiha papkasiga kira olmadi. Skript to'xtatildi."; exit 1; }
echo "   Loyiha papkasi yaratildi va unga kirildi."
echo ""

# 2. Kerakli NPM paketlarini o'rnatish
echo "2. Kerakli NPM paketlari o'rnatilmoqda... Bu biroz vaqt olishi mumkin."
npm install \
  @nestjs/typeorm typeorm pg \
  @nestjs/jwt @nestjs/passport passport passport-jwt \
  @nestjs/platform-socket.io @nestjs/websockets \
  class-validator class-transformer \
  ioredis \
  @nestjs/throttler @nestjs/cache-manager cache-manager \
  @nestjs/common @nestjs/core reflect-metadata rxjs dotenv \
  bcryptjs \
  @nestjs/mapped-types \
  || { echo "NPM paketlarini o'rnatishda xato yuz berdi."; exit 1; }

npm install -D \
  @types/passport-jwt @types/ioredis @types/cache-manager @types/bcryptjs @types/node \
  || { echo "Dev NPM paketlarini o'rnatishda xato yuz berdi."; exit 1; }
echo "   Paketlar muvaffaqiyatli o'rnatildi."
echo ""

# 3. .env faylini yaratish
echo "3. '.env' fayli yaratilmoqda..."
cat << 'EOF' > .env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name

# JWT Configuration
JWT_SECRET=superSecretKeyThatShouldBeLongAndRandom
JWT_EXPIRATION_TIME=3600s # 1 hour

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Rate Limiting
THROTTLE_TTL=60 # seconds
THROTTLE_LIMIT=10 # requests per TTL

# Port
PORT=3000
EOF
echo "   '.env' fayli yaratildi."
echo ""

# 4. src/main.ts faylini yangilash
echo "4. 'src/main.ts' fayli yangilanmoqda..."
cat << 'EOF' > src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'; // Xatolarni boshqarish filtri
import { config } from 'dotenv';

// .env faylini yuklash
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Validatsiya Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOda aniqlanmagan xususiyatlarni olib tashlash
      forbidNonWhitelisted: true, // DTOda aniqlanmagan xususiyatlar bo'lsa xato berish
      transform: true, // Kiruvchi ma'lumotlarni DTO sinflariga avtomatik o'zgartirish
    }),
  );

  // Global Xatolarni Boshqarish Filtrlari
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS ni yoqish (agar frontend boshqa domenda bo'lsa)
  app.enableCors({
    origin: '*', // Barcha domenlardan so'rovlarni qabul qilish. Ishlab chiqarishda aniq domenlarni belgilash tavsiya etiladi.
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
EOF
echo "   'src/main.ts' fayli yangilandi."
echo ""

# 5. src/app.module.ts faylini yangilash
echo "5. 'src/app.module.ts' fayli yangilanmoqda..."
cat << 'EOF' > src/app.module.ts
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
EOF
echo "   'src/app.module.ts' fayli yangilandi."
echo ""

# 6. Umumiy yordamchi fayllarni yaratish (common)
echo "6. 'src/common/' papkasida yordamchi fayllar yaratilmoqda..."
mkdir -p src/common/filters src/common/decorators src/common/guards src/common/interceptors

# src/common/filters/all-exceptions.filter.ts
cat << 'EOF' > src/common/filters/all-exceptions.filter.ts
import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'string' ? message : (message as any).message || message,
    };

    console.error(`Xato yuz berdi: ${JSON.stringify(errorResponse)}`, exception);

    response.status(status).json(errorResponse);
  }
}
EOF

# src/common/decorators/current-user.decorator.ts
cat << 'EOF' > src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Passport JWT strategiyasidan keladigan user obyekti
  },
);
EOF

# src/common/guards/roles.guard.ts
cat << 'EOF' > src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Roles dekoratoridan kalitni import qilish

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // Agar rol talab qilinmasa, ruxsat berish
    }

    const { user } = context.switchToHttp().getRequest();
    // Foydalanuvchi mavjudligini va uning rolini tekshirish
    return user && user.role && requiredRoles.includes(user.role);
  }
}
EOF

# src/common/decorators/roles.decorator.ts
cat << 'EOF' > src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
EOF

# src/common/interceptors/cache.interceptor.ts
cat << 'EOF' > src/common/interceptors/cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    // Faqat GET so'rovlari uchun keshdan foydalanish
    if (request.method !== 'GET') {
      return next.handle();
    }

    const cachedResponse = await this.cacheManager.get(url);
    if (cachedResponse) {
      console.log(`Keshdan olindi: ${url}`);
      return of(cachedResponse); // Keshdan javobni qaytarish
    }

    return next.handle().pipe(
      tap(async (response) => {
        // Javobni keshga saqlash (masalan, 60 soniya)
        await this.cacheManager.set(url, response, 60000);
        console.log(`Keshga saqlandi: ${url}`);
      }),
    );
  }
}
EOF

echo "   'src/common/' papkasidagi fayllar yaratildi."
echo ""

# 7. Redis modulini yaratish
echo "7. 'src/redis/' modulini yaratilmoqda..."
mkdir -p src/redis
cat << 'EOF' > src/redis/redis.module.ts
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
EOF

cat << 'EOF' > src/redis/redis.service.ts
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
EOF

cat << 'EOF' > src/redis/redis.provider.ts
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
EOF
echo "   'src/redis/' moduli yaratildi."
echo ""

# 8. WebSockets (Events Gateway) modulini yaratish
echo "8. 'src/websockets/' modulini yaratilmoqda..."
mkdir -p src/websockets
cat << 'EOF' > src/websockets/events.module.ts
import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { RedisModule } from '../redis/redis.module'; // Redis modulini import qilish

@Module({
  imports: [RedisModule], // Redis modulini import qilish
  providers: [EventsGateway],
  exports: [EventsGateway], // Boshqa modullardan foydalanish uchun eksport qilish
})
export class EventsModule {}
EOF

cat << 'EOF' > src/websockets/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service'; // RedisService ni import qilish
import Redis from 'ioredis'; // Redis tipini import qilish

@WebSocketGateway({
  cors: {
    origin: '*', // Ishlab chiqarishda aniq domenlarni belgilash tavsiya etiladi
    credentials: true,
  },
})
export class EventsGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  private subscriberClient: Redis; // Pub/Sub uchun alohida Redis klienti

  constructor(private readonly redisService: RedisService) {}

  onModuleInit() {
    // Pub/Sub uchun alohida Redis klientini yaratish
    this.subscriberClient = this.redisService.getClient().duplicate();

    // Kanallarga obuna bo'lish
    this.subscriberClient.subscribe('newSale', 'stockUpdate', 'debtorUpdate', (err, count) => {
      if (err) {
        console.error('Redisga obuna bo\'lishda xato:', err);
      } else {
        console.log(`Redis ${count} ta kanalga obuna bo'ldi.`);
      }
    });

    // Redisdan xabarlarni tinglash
    this.subscriberClient.on('message', (channel, message) => {
      console.log(`Redisdan xabar keldi: Kanal - ${channel}, Xabar - ${message}`);
      // Kelgan xabarni barcha ulangan klientlarga yuborish
      this.server.emit(channel, JSON.parse(message));
    });

    console.log('WebSocket Gateway ishga tushdi.');
  }

  // Misol: Klientdan kelgan xabarni qayta ishlash
  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): void {
    console.log(`Klientdan xabar: ${data}`);
    // Klientga javob yuborish
    client.emit('messageToClient', `Sizning xabaringiz qabul qilindi: ${data}`);
  }

  // Yangi klient ulanganida
  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Klient ulandi: ${client.id}`);
    // Klientga salom xabari yuborish
    client.emit('connected', 'Serverga muvaffaqiyatli ulandingiz!');
  }

  // Klient uzilganida
  handleDisconnect(client: Socket) {
    console.log(`Klient uzildi: ${client.id}`);
  }

  // Barcha ulangan klientlarga xabar yuborish uchun umumiy metod
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
EOF
echo "   'src/websockets/' moduli yaratildi."
echo ""

# 9. Entitilarni yaratish
echo "9. Entitilarni yaratilmoqda..."
mkdir -p src/users/entities src/sales/entities src/stock/entities src/debtors/entities src/markets/entities src/activity-log/entities

# User Entity
cat << 'EOF' > src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Stock } from '../../stock/entities/stock.entity';
import { Market } from '../../markets/entities/market.entity';
import { Debtor } from '../../debtors/entities/debtor.entity';
import { ActivityLog } from '../../activity-log/entities/activity-log.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'user' }) // 'admin', 'manager', 'user'
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Sale, (sale) => sale.createdBy)
  createdSales: Sale[];

  @OneToMany(() => Sale, (sale) => sale.updatedBy)
  updatedSales: Sale[];

  @OneToMany(() => Stock, (stock) => stock.createdBy)
  createdStocks: Stock[];

  @OneToMany(() => Stock, (stock) => stock.updatedBy)
  updatedStocks: Stock[];

  @OneToMany(() => Market, (market) => market.createdBy)
  createdMarkets: Market[];

  @OneToMany(() => Market, (market) => market.updatedBy)
  updatedMarkets: Market[];

  @OneToMany(() => Debtor, (debtor) => debtor.createdBy)
  createdDebtors: Debtor[];

  @OneToMany(() => Debtor, (debtor) => debtor.updatedBy)
  updatedDebtors: Debtor[];

  @OneToMany(() => ActivityLog, (log) => log.createdBy)
  createdActivityLogs: ActivityLog[];
}
EOF

# Debtor Entity
cat << 'EOF' > src/debtors/entities/debtor.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { User } from '../../users/entities/user.entity';

@Entity('debtors')
export class Debtor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  contactInfo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentDebtAmount: number;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  debtItems: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalItemAmount: number;
    saleId: string;
    debtDate?: Date;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdDebtors, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedDebtors, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @OneToMany(() => Sale, (sale) => sale.debtor)
  sales: Sale[];
}
EOF

# Sale Entity
cat << 'EOF' > src/sales/entities/sale.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Debtor } from '../../debtors/entities/debtor.entity';
import { Market } from '../../markets/entities/market.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'jsonb' })
  productsSold: {
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalItemAmount: number;
  }[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debtAmount: number;

  @Column({ default: 'cash' }) // 'cash', 'card', 'debt'
  paymentMethod: string;

  @Column({ default: false })
  isReturned: boolean;

  @CreateDateColumn()
  saleDate: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdSales, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedSales, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @ManyToOne(() => Debtor, (debtor) => debtor.sales, { nullable: true })
  @JoinColumn({ name: 'debtorId' })
  debtor: Debtor;

  @Column({ nullable: true })
  debtorId: string;

  @ManyToOne(() => Market, (market) => market.sales, { nullable: true })
  @JoinColumn({ name: 'marketId' })
  market: Market;

  @Column({ nullable: true })
  marketId: string;
}
EOF

# Stock Entity
cat << 'EOF' > src/stock/entities/stock.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('stock')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  productName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column()
  unit: string; // 'kg', 'dona', 'metr'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdStocks, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedStocks, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;
}
EOF

# Market Entity
cat << 'EOF' > src/markets/entities/market.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { User } from '../../users/entities/user.entity';

@Entity('markets')
export class Market {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contactInfo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdMarkets, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @ManyToOne(() => User, (user) => user.updatedMarkets, { nullable: true })
  @JoinColumn({ name: 'updatedById' })
  updatedBy: User;

  @Column({ nullable: true })
  updatedById: string;

  @OneToMany(() => Sale, (sale) => sale.market)
  sales: Sale[];
}
EOF

# ActivityLog Entity
cat << 'EOF' > src/activity-log/entities/activity-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string; // 'CREATE_SALE', 'UPDATE_STOCK', 'LOGIN'

  @Column({ nullable: true })
  entityType: string; // 'Sale', 'Stock', 'User', 'Debtor'

  @Column({ nullable: true })
  entityId: string; // Ta'sir qilingan entitiyning IDsi

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Qo'shimcha ma'lumotlar (masalan, o'zgarishlar)

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.createdActivityLogs, { nullable: true })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;
}
EOF
echo "   Entitilar muvaffaqiyatli yaratildi."
echo ""

# 10. DTO fayllarini yaratish
echo "10. DTO fayllari yaratilmoqda..."
mkdir -p src/users/dto src/sales/dto src/stock/dto src/debtors/dto src/markets/dto src/activity-log/dto

# User DTOs
cat << 'EOF' > src/users/dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(['admin', 'manager', 'user'])
  role: string;
}
EOF
cat << 'EOF' > src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string; // Parolni yangilash uchun
}
EOF
cat << 'EOF' > src/users/dto/user-response.dto.ts
export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
EOF
cat << 'EOF' > src/users/dto/filter-user.dto.ts
import { IsString, IsOptional, IsEnum } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'user'])
  role?: string;
}
EOF

# Debtor DTOs
cat << 'EOF' > src/debtors/dto/create-debtor.dto.ts
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class DebtItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  totalItemAmount: number;

  @IsUUID()
  saleId: string;
}

export class CreateDebtorDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsNumber()
  currentDebtAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DebtItemDto)
  debtItems?: DebtItemDto[];
}
EOF
cat << 'EOF' > src/debtors/dto/update-debtor.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtorDto } from './create-debtor.dto';
import { IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateDebtItemDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  totalItemAmount: number;

  @IsUUID()
  saleId: string;
}

export class UpdateDebtorDto extends PartialType(CreateDebtorDto) {
  @IsOptional()
  @IsNumber()
  currentDebtAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDebtItemDto)
  debtItems?: UpdateDebtItemDto[];
}
EOF
cat << 'EOF' > src/debtors/dto/debtor-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';

class DebtItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalItemAmount: number;
  saleId: string;
  debtDate?: Date;
}

export class DebtorResponseDto {
  id: string;
  name: string;
  contactInfo: string;
  currentDebtAmount: number;
  debtItems: DebtItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
EOF
cat << 'EOF' > src/debtors/dto/filter-debtor.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FilterDebtorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsNumber()
  minDebtAmount?: number;

  @IsOptional()
  @IsNumber()
  maxDebtAmount?: number;
}
EOF

# Sale DTOs
cat << 'EOF' > src/sales/dto/create-sale.dto.ts
import { IsArray, IsNumber, IsString, ValidateNested, IsUUID, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class ProductSoldDto {
  @IsUUID()
  productId: string;

  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  pricePerUnit: number;

  @IsNumber()
  totalItemAmount: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductSoldDto)
  productsSold: ProductSoldDto[];

  @IsNumber()
  totalAmount: number;

  @IsNumber()
  @IsOptional()
  amountPaid?: number;

  @IsNumber()
  @IsOptional()
  debtAmount?: number;

  @IsEnum(['cash', 'card', 'debt'])
  paymentMethod: 'cash' | 'card' | 'debt';

  @IsOptional()
  @IsUUID()
  debtorId?: string;

  @IsOptional()
  @IsUUID()
  marketId?: string;
}
EOF
cat << 'EOF' > src/sales/dto/update-sale.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @IsOptional()
  @IsBoolean()
  isReturned?: boolean;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  debtAmount?: number;

  @IsOptional()
  @IsEnum(['cash', 'card', 'debt'])
  paymentMethod?: 'cash' | 'card' | 'debt';
}
EOF
cat << 'EOF' > src/sales/dto/sale-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { DebtorResponseDto } from '../../debtors/dto/debtor-response.dto';
import { MarketResponseDto } from '../../markets/dto/market-response.dto';

class ProductSoldResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalItemAmount: number;
}

export class SaleResponseDto {
  id: string;
  productsSold: ProductSoldResponseDto[];
  totalAmount: number;
  amountPaid: number;
  debtAmount: number;
  paymentMethod: string;
  isReturned: boolean;
  saleDate: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
  debtor?: DebtorResponseDto;
  market?: MarketResponseDto;
}
EOF
cat << 'EOF' > src/sales/dto/filter-sale.dto.ts
import { IsOptional, IsString, IsUUID, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterSaleDto {
  @IsOptional()
  @IsUUID()
  debtorId?: string;

  @IsOptional()
  @IsUUID()
  marketId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isReturned?: boolean;

  @IsOptional()
  @IsEnum(['cash', 'card', 'debt'])
  paymentMethod?: 'cash' | 'card' | 'debt';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minTotalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxTotalAmount?: number;

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}
EOF

# Stock DTOs
cat << 'EOF' > src/stock/dto/create-stock.dto.ts
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStockDto {
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;
}
EOF
cat << 'EOF' > src/stock/dto/update-stock.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number; // Faqat miqdorni yangilash uchun
}
EOF
cat << 'EOF' > src/stock/dto/stock-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class StockResponseDto {
  id: string;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
EOF
cat << 'EOF' > src/stock/dto/filter-stock.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FilterStockDto {
  @IsOptional()
  @IsString()
  productName?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}
EOF

# Market DTOs
cat << 'EOF' > src/markets/dto/create-market.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateMarketDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}
EOF
cat << 'EOF' > src/markets/dto/update-market.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateMarketDto } from './create-market.dto';

export class UpdateMarketDto extends PartialType(CreateMarketDto) {}
EOF
cat << 'EOF' > src/markets/dto/market-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class MarketResponseDto {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
EOF
cat << 'EOF' > src/markets/dto/filter-market.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class FilterMarketDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
EOF

# ActivityLog DTOs
cat << 'EOF' > src/activity-log/dto/create-activity-log.dto.ts
import { IsString, IsOptional, IsObject, IsUUID } from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  action: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  createdById?: string; // Log yaratgan foydalanuvchi IDsi
}
EOF
cat << 'EOF' > src/activity-log/dto/activity-log-response.dto.ts
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ActivityLogResponseDto {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  createdBy?: UserResponseDto;
}
EOF
cat << 'EOF' > src/activity-log/dto/filter-activity-log.dto.ts
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class FilterActivityLogDto {
  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  createdById?: string;

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}
EOF
echo "   DTO fayllari muvaffaqiyatli yaratildi."
echo ""

# 11. Modullar, Servislar va Kontrollerlarni yaratish
echo "11. Modullar, Servislar va Kontrollerlar yaratilmoqda..."

# Auth Module (JWT Strategy, Service, Controller)
mkdir -p src/auth
cat << 'EOF' > src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ActivityLogModule } from '../activity-log/activity-log.module'; // ActivityLogModule ni import qilish

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET, // .env dan olinadi
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME },
    }),
    ActivityLogModule, // ActivityLogModule ni qo'shish
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService], // AuthService ni boshqa modullarga eksport qilish
})
export class AuthModule {}
EOF

cat << 'EOF' > src/auth/auth.service.ts
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { ActivityLogService } from '../activity-log/activity-log.service'; // ActivityLogService ni import qilish

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private activityLogService: ActivityLogService, // ActivityLogService ni inject qilish
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Noto\'g\'ri elektron pochta yoki parol');
    }
    const payload = { username: user.username, sub: user.id, role: user.role };

    // Faoliyat jurnaliga yozish
    await this.activityLogService.create({
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      details: {
        username: user.username,
        email: user.email,
      },
      createdById: user.id,
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersService.findByEmail(registerUserDto.email);
    if (existingUser) {
      throw new BadRequestException('Ushbu elektron pochta allaqachon ro\'yxatdan o\'tgan.');
    }

    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    const newUser = await this.usersService.create({
      ...registerUserDto,
      passwordHash: hashedPassword,
    });

    // Faoliyat jurnaliga yozish
    await this.activityLogService.create({
      action: 'REGISTER_USER',
      entityType: 'User',
      entityId: newUser.id,
      details: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      createdById: newUser.id, // Ro'yxatdan o'tgan foydalanuvchi o'zi yaratilgan
    });

    return newUser;
  }
}
EOF

cat << 'EOF' > src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // JwtAuthGuard ni import qilish
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: UserResponseDto) {
    return user;
  }
}
EOF

# Auth DTOs
mkdir -p src/auth/dto src/auth/guards
cat << 'EOF' > src/auth/dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
EOF
cat << 'EOF' > src/auth/dto/register-user.dto.ts
import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'manager', 'user'])
  role?: string = 'user';
}
EOF

# JWT Strategy
cat << 'EOF' > src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    // payload.sub - bu foydalanuvchi IDsi
    const user = await this.usersService.findOne(payload.sub);
    // Parol xeshini qaytarmaslik uchun
    const { passwordHash, ...result } = user;
    return result;
  }
}
EOF

# JWT Guard
cat << 'EOF' > src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
EOF

# Users Module (Service, Controller)
cat << 'EOF' > src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module'; // ActivityLogModule ni import qilish

@Module({
  imports: [TypeOrmModule.forFeature([User]), ActivityLogModule], // ActivityLogModule ni qo'shish
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule], // UsersService va TypeOrmModule ni eksport qilish
})
export class UsersModule {}
EOF

cat << 'EOF' > src/users/users.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import * as bcrypt from 'bcryptjs';
import { ActivityLogService } from '../activity-log/activity-log.service'; // ActivityLogService ni import qilish

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private activityLogService: ActivityLogService, // ActivityLogService ni inject qilish
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.usersRepository.findOne({ where: [{ email: createUserDto.email }, { username: createUserDto.username }] });
    if (existingUser) {
      throw new BadRequestException('Ushbu foydalanuvchi nomi yoki elektron pochta allaqachon mavjud.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(newUser);

    // Faoliyat jurnaliga yozish
    await this.activityLogService.create({
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: savedUser.id,
      details: { username: savedUser.username, email: savedUser.email, role: savedUser.role },
      createdById: savedUser.id, // Yaratuvchi o'zi
    });

    const { passwordHash, ...result } = savedUser;
    return result as UserResponseDto;
  }

  async findAll(filterDto: FilterUserDto): Promise<UserResponseDto[]> {
    const query = this.usersRepository.createQueryBuilder('user');

    if (filterDto.username) {
      query.andWhere('user.username ILIKE :username', { username: `%${filterDto.username}%` });
    }
    if (filterDto.email) {
      query.andWhere('user.email ILIKE :email', { email: `%${filterDto.email}%` });
    }
    if (filterDto.role) {
      query.andWhere('user.role = :role', { role: filterDto.role });
    }

    const users = await query.getMany();
    return users.map(user => {
      const { passwordHash, ...result } = user;
      return result as UserResponseDto;
    });
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`IDsi ${id} bo'lgan foydalanuvchi topilmadi.`);
    }
    const { passwordHash, ...result } = user;
    return result as UserResponseDto;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, updaterId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`IDsi ${id} bo'lgan foydalanuvchi topilmadi.`);
    }

    const oldUser = { ...user }; // Eski ma'lumotlarni saqlash

    if (updateUserDto.password) {
      updateUserDto.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password; // DTOdan passwordni o'chirish
    }

    Object.assign(user, updateUserDto);
    user.updatedById = updaterId; // Kim yangilaganini belgilash
    const updatedUser = await this.usersRepository.save(user);

    // Faoliyat jurnaliga yozish
    await this.activityLogService.create({
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: updatedUser.id,
      details: {
        oldData: { username: oldUser.username, email: oldUser.email, role: oldUser.role },
        newData: { username: updatedUser.username, email: updatedUser.email, role: updatedUser.role },
      },
      createdById: updaterId,
    });

    const { passwordHash, ...result } = updatedUser;
    return result as UserResponseDto;
  }

  async remove(id: string, removerId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`IDsi ${id} bo'lgan foydalanuvchi topilmadi.`);
    }
    await this.usersRepository.remove(user);

    // Faoliyat jurnaliga yozish
    await this.activityLogService.create({
      action: 'DELETE_USER',
      entityType: 'User',
      entityId: id,
      details: { username: user.username, email: user.email },
      createdById: removerId,
    });
  }
}
EOF

cat << 'EOF' > src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterUserDto } from './dto/filter-user.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor'; // Kesh interseptorini import qilish

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Barcha metodlarga himoyani qo'llash
@UseInterceptors(HttpCacheInterceptor) // Barcha GET so'rovlari uchun keshni qo'llash
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin') // Faqat 'admin' roliga ega foydalanuvchilar yaratishi mumkin
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin', 'manager') // 'admin' va 'manager' ko'rishi mumkin
  async findAll(@Query() filterDto: FilterUserDto): Promise<UserResponseDto[]> {
    return this.usersService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: UserResponseDto, // Joriy foydalanuvchini olish
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto, user.id);
  }

  @Delete(':id')
  @Roles('admin')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<void> {
    return this.usersService.remove(id, user.id);
  }
}
EOF

# Stock Module
cat << 'EOF' > src/stock/stock.module.ts
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
EOF

cat << 'EOF' > src/stock/stock.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { StockResponseDto } from './dto/stock-response.dto';
import { FilterStockDto } from './dto/filter-stock.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway'; // EventsGateway ni import qilish

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
    private activityLogService: ActivityLogService,
    private eventsGateway: EventsGateway, // EventsGateway ni inject qilish
  ) {}

  async create(createStockDto: CreateStockDto, createdById: string): Promise<StockResponseDto> {
    const existingStock = await this.stockRepository.findOne({ where: { productName: createStockDto.productName } });
    if (existingStock) {
      throw new BadRequestException('Ushbu nomdagi mahsulot allaqachon mavjud.');
    }

    const newStock = this.stockRepository.create({ ...createStockDto, createdById });
    const savedStock = await this.stockRepository.save(newStock);

    await this.activityLogService.create({
      action: 'CREATE_STOCK',
      entityType: 'Stock',
      entityId: savedStock.id,
      details: { productName: savedStock.productName, quantity: savedStock.quantity, price: savedStock.price },
      createdById: createdById,
    });

    this.eventsGateway.emitToAll('stockUpdate', savedStock); // WebSocket orqali yangilanish yuborish
    return savedStock;
  }

  async findAll(filterDto: FilterStockDto): Promise<StockResponseDto[]> {
    const query = this.stockRepository.createQueryBuilder('stock');

    if (filterDto.productName) {
      query.andWhere('stock.productName ILIKE :productName', { productName: `%${filterDto.productName}%` });
    }
    if (filterDto.unit) {
      query.andWhere('stock.unit = :unit', { unit: filterDto.unit });
    }
    if (filterDto.minQuantity) {
      query.andWhere('stock.quantity >= :minQuantity', { minQuantity: filterDto.minQuantity });
    }
    if (filterDto.maxQuantity) {
      query.andWhere('stock.quantity <= :maxQuantity', { maxQuantity: filterDto.maxQuantity });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<StockResponseDto> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }
    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto, updatedById: string): Promise<StockResponseDto> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }

    const oldStock = { ...stock };

    Object.assign(stock, updateStockDto);
    stock.updatedById = updatedById;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'UPDATE_STOCK',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: {
        oldQuantity: oldStock.quantity,
        newQuantity: updatedStock.quantity,
        oldPrice: oldStock.price,
        newPrice: updatedStock.price,
      },
      createdById: updatedById,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock); // WebSocket orqali yangilanish yuborish
    return updatedStock;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const stock = await this.stockRepository.findOne({ where: { id } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${id} bo'lgan mahsulot topilmadi.`);
    }
    await this.stockRepository.remove(stock);

    await this.activityLogService.create({
      action: 'DELETE_STOCK',
      entityType: 'Stock',
      entityId: id,
      details: { productName: stock.productName, quantity: stock.quantity },
      createdById: removedById,
    });

    this.eventsGateway.emitToAll('stockUpdate', { id, deleted: true }); // WebSocket orqali o'chirilganini bildirish
  }

  // Mahsulot miqdorini kamaytirish (sotuv uchun)
  async decreaseStockQuantity(productId: string, quantity: number, userId: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id: productId } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${productId} bo'lgan mahsulot topilmadi.`);
    }
    if (stock.quantity < quantity) {
      throw new BadRequestException(`${stock.productName} mahsuloti uchun yetarli miqdor yo'q. Mavjud: ${stock.quantity}`);
    }

    const oldQuantity = stock.quantity;
    stock.quantity -= quantity;
    stock.updatedById = userId;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'DECREASE_STOCK_QUANTITY',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: { productName: updatedStock.productName, oldQuantity, newQuantity: updatedStock.quantity, decreasedBy: quantity },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock);
    return updatedStock;
  }

  // Mahsulot miqdorini oshirish (qaytarganda yoki kirimda)
  async increaseStockQuantity(productId: string, quantity: number, userId: string): Promise<Stock> {
    const stock = await this.stockRepository.findOne({ where: { id: productId } });
    if (!stock) {
      throw new NotFoundException(`IDsi ${productId} bo'lgan mahsulot topilmadi.`);
    }

    const oldQuantity = stock.quantity;
    stock.quantity += quantity;
    stock.updatedById = userId;
    const updatedStock = await this.stockRepository.save(stock);

    await this.activityLogService.create({
      action: 'INCREASE_STOCK_QUANTITY',
      entityType: 'Stock',
      entityId: updatedStock.id,
      details: { productName: updatedStock.productName, oldQuantity, newQuantity: updatedStock.quantity, increasedBy: quantity },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('stockUpdate', updatedStock);
    return updatedStock;
  }
}
EOF

cat << 'EOF' > src/stock/stock.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StockResponseDto } from './dto/stock-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterStockDto } from './dto/filter-stock.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createStockDto: CreateStockDto,
    @CurrentUser() user: any,
  ): Promise<StockResponseDto> {
    return this.stockService.create(createStockDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterStockDto): Promise<StockResponseDto[]> {
    return this.stockService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<StockResponseDto> {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @CurrentUser() user: any,
  ): Promise<StockResponseDto> {
    return this.stockService.update(id, updateStockDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.stockService.remove(id, user.id);
  }
}
EOF

# Debtors Module
cat << 'EOF' > src/debtors/debtors.module.ts
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
EOF

cat << 'EOF' > src/debtors/debtors.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Debtor } from './entities/debtor.entity';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { DebtorResponseDto } from './dto/debtor-response.dto';
import { FilterDebtorDto } from './dto/filter-debtor.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway';

@Injectable()
export class DebtorsService {
  constructor(
    @InjectRepository(Debtor)
    private debtorsRepository: Repository<Debtor>,
    private activityLogService: ActivityLogService,
    private eventsGateway: EventsGateway,
  ) {}

  async create(createDebtorDto: CreateDebtorDto, createdById: string): Promise<DebtorResponseDto> {
    const existingDebtor = await this.debtorsRepository.findOne({ where: { name: createDebtorDto.name } });
    if (existingDebtor) {
      throw new BadRequestException('Ushbu nomdagi qarzdor allaqachon mavjud.');
    }

    const newDebtor = this.debtorsRepository.create({ ...createDebtorDto, createdById });
    const savedDebtor = await this.debtorsRepository.save(newDebtor);

    await this.activityLogService.create({
      action: 'CREATE_DEBTOR',
      entityType: 'Debtor',
      entityId: savedDebtor.id,
      details: { name: savedDebtor.name, currentDebtAmount: savedDebtor.currentDebtAmount },
      createdById: createdById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', savedDebtor);
    return savedDebtor;
  }

  async findAll(filterDto: FilterDebtorDto): Promise<DebtorResponseDto[]> {
    const query = this.debtorsRepository.createQueryBuilder('debtor');

    if (filterDto.name) {
      query.andWhere('debtor.name ILIKE :name', { name: `%${filterDto.name}%` });
    }
    if (filterDto.contactInfo) {
      query.andWhere('debtor.contactInfo ILIKE :contactInfo', { contactInfo: `%${filterDto.contactInfo}%` });
    }
    if (filterDto.minDebtAmount) {
      query.andWhere('debtor.currentDebtAmount >= :minDebtAmount', { minDebtAmount: filterDto.minDebtAmount });
    }
    if (filterDto.maxDebtAmount) {
      query.andWhere('debtor.currentDebtAmount <= :maxDebtAmount', { maxDebtAmount: filterDto.maxDebtAmount });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<DebtorResponseDto> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }
    return debtor;
  }

  async update(id: string, updateDebtorDto: UpdateDebtorDto, updatedById: string): Promise<DebtorResponseDto> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }

    const oldDebtor = { ...debtor };

    Object.assign(debtor, updateDebtorDto);
    debtor.updatedById = updatedById;
    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'UPDATE_DEBTOR',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        oldDebtAmount: oldDebtor.currentDebtAmount,
        newDebtAmount: updatedDebtor.currentDebtAmount,
        oldDebtItems: oldDebtor.debtItems,
        newDebtItems: updatedDebtor.debtItems,
      },
      createdById: updatedById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const debtor = await this.debtorsRepository.findOne({ where: { id } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${id} bo'lgan qarzdor topilmadi.`);
    }
    await this.debtorsRepository.remove(debtor);

    await this.activityLogService.create({
      action: 'DELETE_DEBTOR',
      entityType: 'Debtor',
      entityId: id,
      details: { name: debtor.name },
      createdById: removedById,
    });

    this.eventsGateway.emitToAll('debtorUpdate', { id, deleted: true });
  }

  // Qarzdorlikni yangilash (sotuvdan kelib chiqqan)
  async updateDebtorDebt(
    debtorId: string,
    saleId: string,
    debtAmount: number,
    debtItems: { productId: string; productName: string; quantity: number; unit: string; pricePerUnit: number; totalItemAmount: number }[],
    userId: string,
  ): Promise<Debtor> {
    const debtor = await this.debtorsRepository.findOne({ where: { id: debtorId } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${debtorId} bo'lgan qarzdor topilmadi.`);
    }

    const oldDebtAmount = debtor.currentDebtAmount;
    const oldDebtItems = [...debtor.debtItems];

    debtor.currentDebtAmount = parseFloat((debtor.currentDebtAmount + debtAmount).toFixed(2));
    debtor.debtItems = [
      ...debtor.debtItems,
      ...debtItems.map(item => ({ ...item, saleId, debtDate: new Date() })),
    ];
    debtor.updatedById = userId;

    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'DEBTOR_DEBT_UPDATE',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        change: debtAmount,
        oldDebt: oldDebtAmount,
        newDebt: updatedDebtor.currentDebtAmount,
        saleId: saleId,
        addedItems: debtItems,
      },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }

  // Qarzdorlikni to'lash (qarzni kamaytirish)
  async payOffDebt(
    debtorId: string,
    amountPaid: number,
    userId: string,
  ): Promise<Debtor> {
    const debtor = await this.debtorsRepository.findOne({ where: { id: debtorId } });
    if (!debtor) {
      throw new NotFoundException(`IDsi ${debtorId} bo'lgan qarzdor topilmadi.`);
    }

    if (debtor.currentDebtAmount < amountPaid) {
      throw new BadRequestException(`Qarzdorlik ${debtor.currentDebtAmount} dan kam, ${amountPaid} to'lash mumkin emas.`);
    }

    const oldDebtAmount = debtor.currentDebtAmount;
    debtor.currentDebtAmount = parseFloat((debtor.currentDebtAmount - amountPaid).toFixed(2));
    debtor.updatedById = userId;

    // To'langan qarzga mos keladigan buyumlarni debtItems dan olib tashlash logikasi murakkabroq bo'lishi mumkin.
    // Hozircha faqat umumiy summani kamaytiramiz. Agar har bir item bo'yicha to'lov kerak bo'lsa, bu logikani kengaytirish kerak.
    // Misol uchun, eng eski qarz buyumlaridan boshlab to'lash mumkin.
    let remainingPayment = amountPaid;
    const newDebtItems = [];
    for (const item of debtor.debtItems) {
      if (remainingPayment <= 0) {
        newDebtItems.push(item);
        continue;
      }
      if (item.totalItemAmount <= remainingPayment) {
        remainingPayment -= item.totalItemAmount;
      } else {
        // Qisman to'lov
        const newItem = { ...item, totalItemAmount: item.totalItemAmount - remainingPayment };
        newDebtItems.push(newItem);
        remainingPayment = 0;
      }
    }
    debtor.debtItems = newDebtItems;


    const updatedDebtor = await this.debtorsRepository.save(debtor);

    await this.activityLogService.create({
      action: 'DEBTOR_PAYMENT',
      entityType: 'Debtor',
      entityId: updatedDebtor.id,
      details: {
        amountPaid: amountPaid,
        oldDebt: oldDebtAmount,
        newDebt: updatedDebtor.currentDebtAmount,
      },
      createdById: userId,
    });

    this.eventsGateway.emitToAll('debtorUpdate', updatedDebtor);
    return updatedDebtor;
  }
}
EOF

cat << 'EOF' > src/debtors/debtors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { DebtorsService } from './debtors.service';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DebtorResponseDto } from './dto/debtor-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterDebtorDto } from './dto/filter-debtor.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('debtors')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class DebtorsController {
  constructor(private readonly debtorsService: DebtorsService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createDebtorDto: CreateDebtorDto,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.create(createDebtorDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterDebtorDto): Promise<DebtorResponseDto[]> {
    return this.debtorsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<DebtorResponseDto> {
    return this.debtorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateDebtorDto: UpdateDebtorDto,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.update(id, updateDebtorDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.debtorsService.remove(id, user.id);
  }

  @Post(':id/pay-debt')
  @Roles('admin', 'manager', 'user') // Har qanday rol to'lashi mumkin
  async payOffDebt(
    @Param('id') id: string,
    @Body('amountPaid') amountPaid: number,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.payOffDebt(id, amountPaid, user.id);
  }
}
EOF

# Markets Module
cat << 'EOF' > src/markets/markets.module.ts
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
EOF

cat << 'EOF' > src/markets/markets.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from './entities/market.entity';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketResponseDto } from './dto/market-response.dto';
import { FilterMarketDto } from './dto/filter-market.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createMarketDto: CreateMarketDto, createdById: string): Promise<MarketResponseDto> {
    const existingMarket = await this.marketsRepository.findOne({ where: { name: createMarketDto.name } });
    if (existingMarket) {
      throw new BadRequestException('Ushbu nomdagi bozor allaqachon mavjud.');
    }

    const newMarket = this.marketsRepository.create({ ...createMarketDto, createdById });
    const savedMarket = await this.marketsRepository.save(newMarket);

    await this.activityLogService.create({
      action: 'CREATE_MARKET',
      entityType: 'Market',
      entityId: savedMarket.id,
      details: { name: savedMarket.name, address: savedMarket.address },
      createdById: createdById,
    });

    return savedMarket;
  }

  async findAll(filterDto: FilterMarketDto): Promise<MarketResponseDto[]> {
    const query = this.marketsRepository.createQueryBuilder('market');

    if (filterDto.name) {
      query.andWhere('market.name ILIKE :name', { name: `%${filterDto.name}%` });
    }
    if (filterDto.address) {
      query.andWhere('market.address ILIKE :address', { address: `%${filterDto.address}%` });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<MarketResponseDto> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }
    return market;
  }

  async update(id: string, updateMarketDto: UpdateMarketDto, updatedById: string): Promise<MarketResponseDto> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }

    const oldMarket = { ...market };

    Object.assign(market, updateMarketDto);
    market.updatedById = updatedById;
    const updatedMarket = await this.marketsRepository.save(market);

    await this.activityLogService.create({
      action: 'UPDATE_MARKET',
      entityType: 'Market',
      entityId: updatedMarket.id,
      details: {
        oldName: oldMarket.name,
        newName: updatedMarket.name,
        oldAddress: oldMarket.address,
        newAddress: updatedMarket.address,
      },
      createdById: updatedById,
    });

    return updatedMarket;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }
    await this.marketsRepository.remove(market);

    await this.activityLogService.create({
      action: 'DELETE_MARKET',
      entityType: 'Market',
      entityId: id,
      details: { name: market.name },
      createdById: removedById,
    });
  }
}
EOF

cat << 'EOF' > src/markets/markets.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MarketResponseDto } from './dto/market-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterMarketDto } from './dto/filter-market.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('markets')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createMarketDto: CreateMarketDto,
    @CurrentUser() user: any,
  ): Promise<MarketResponseDto> {
    return this.marketsService.create(createMarketDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterMarketDto): Promise<MarketResponseDto[]> {
    return this.marketsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<MarketResponseDto> {
    return this.marketsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateMarketDto: UpdateMarketDto,
    @CurrentUser() user: any,
  ): Promise<MarketResponseDto> {
    return this.marketsService.update(id, updateMarketDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.marketsService.remove(id, user.id);
  }
}
EOF

# ActivityLog Module
cat << 'EOF' > src/activity-log/activity-log.module.ts
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
EOF

cat << 'EOF' > src/activity-log/activity-log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLogResponseDto> {
    const newLog = this.activityLogRepository.create(createActivityLogDto);
    return this.activityLogRepository.save(newLog);
  }

  async findAll(filterDto: FilterActivityLogDto): Promise<ActivityLogResponseDto[]> {
    const query = this.activityLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.createdBy', 'user'); // Yaratuvchi foydalanuvchini yuklash

    if (filterDto.action) {
      query.andWhere('log.action ILIKE :action', { action: `%${filterDto.action}%` });
    }
    if (filterDto.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filterDto.entityType });
    }
    if (filterDto.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filterDto.entityId });
    }
    if (filterDto.createdById) {
      query.andWhere('log.createdById = :createdById', { createdById: filterDto.createdById });
    }
    if (filterDto.startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate: new Date(filterDto.startDate) });
    }
    if (filterDto.endDate) {
      const endDate = new Date(filterDto.endDate);
      endDate.setHours(23, 59, 59, 999); // Kun oxirigacha
      query.andWhere('log.timestamp <= :endDate', { endDate: endDate });
    }

    query.orderBy('log.timestamp', 'DESC'); // Eng yangilarini birinchi ko'rsatish

    return query.getMany();
  }

  async findOne(id: string): Promise<ActivityLogResponseDto> {
    const log = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!log) {
      throw new NotFoundException(`IDsi ${id} bo'lgan faoliyat jurnali topilmadi.`);
    }
    return log;
  }
}
EOF

cat << 'EOF' > src/activity-log/activity-log.controller.ts
import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles('admin', 'manager') // Faqat 'admin' va 'manager' ko'rishi mumkin
  async findAll(@Query() filterDto: FilterActivityLogDto): Promise<ActivityLogResponseDto[]> {
    return this.activityLogService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: string): Promise<ActivityLogResponseDto> {
    return this.activityLogService.findOne(id);
  }
}
EOF

# Sales Module (Eng murakkab biznes logika shu yerda)
cat << 'EOF' > src/sales/sales.module.ts
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
EOF

cat << 'EOF' > src/sales/sales.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { SaleResponseDto } from './dto/sale-response.dto';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { StockService } from '../stock/stock.service';
import { DebtorsService } from '../debtors/debtors.service';
import { MarketsService } from '../markets/markets.service';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { EventsGateway } from '../websockets/events.gateway'; // EventsGateway ni import qilish

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    private stockService: StockService,
    private debtorsService: DebtorsService,
    private marketsService: MarketsService,
    private activityLogService: ActivityLogService,
    private dataSource: DataSource, // Tranzaksiyalar uchun DataSource
    private eventsGateway: EventsGateway, // EventsGateway ni inject qilish
  ) {}

  async create(createSaleDto: CreateSaleDto, createdById: string): Promise<SaleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Mahsulotlar mavjudligini va miqdorini tekshirish, omborni yangilash
      for (const item of createSaleDto.productsSold) {
        const stockItem = await this.stockService.findOne(item.productId);
        if (!stockItem) {
          throw new NotFoundException(`Mahsulot IDsi ${item.productId} topilmadi.`);
        }
        if (stockItem.quantity < item.quantity) {
          throw new BadRequestException(`${stockItem.productName} mahsuloti uchun yetarli miqdor yo'q. Mavjud: ${stockItem.quantity}`);
        }
        // Ombor miqdorini kamaytirish
        await this.stockService.decreaseStockQuantity(item.productId, item.quantity, createdById);
      }

      // 2. Sotuvni yaratish
      const newSale = this.salesRepository.create({
        ...createSaleDto,
        createdById,
        amountPaid: createSaleDto.amountPaid || 0,
        debtAmount: createSaleDto.debtAmount || 0,
      });

      // Agar qarzdorlik bo'lsa, debtorId majburiy
      if (newSale.paymentMethod === 'debt' && !newSale.debtorId) {
        throw new BadRequestException('Qarzga sotilganda qarzdor IDsi majburiy.');
      }

      // Agar marketId berilgan bo'lsa, uning mavjudligini tekshirish
      if (newSale.marketId) {
        const market = await this.marketsService.findOne(newSale.marketId);
        if (!market) {
          throw new NotFoundException(`Bozor IDsi ${newSale.marketId} topilmadi.`);
        }
      }

      const savedSale = await queryRunner.manager.save(Sale, newSale);

      // 3. Agar to'lov usuli "debt" bo'lsa, qarzdorlikni yangilash
      if (savedSale.paymentMethod === 'debt' && savedSale.debtorId && savedSale.debtAmount > 0) {
        await this.debtorsService.updateDebtorDebt(
          savedSale.debtorId,
          savedSale.id,
          savedSale.debtAmount,
          savedSale.productsSold,
          createdById,
        );
      }

      // 4. Faoliyat jurnaliga yozish
      await this.activityLogService.create({
        action: 'CREATE_SALE',
        entityType: 'Sale',
        entityId: savedSale.id,
        details: {
          totalAmount: savedSale.totalAmount,
          paymentMethod: savedSale.paymentMethod,
          products: savedSale.productsSold.map(p => ({ name: p.productName, quantity: p.quantity })),
          debtorId: savedSale.debtorId,
        },
        createdById: createdById,
      });

      await queryRunner.commitTransaction();

      this.eventsGateway.emitToAll('newSale', savedSale); // WebSocket orqali yangi sotuvni yuborish
      return savedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni yaratishda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(filterDto: FilterSaleDto): Promise<SaleResponseDto[]> {
    const query = this.salesRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.createdBy', 'createdBy')
      .leftJoinAndSelect('sale.updatedBy', 'updatedBy')
      .leftJoinAndSelect('sale.debtor', 'debtor')
      .leftJoinAndSelect('sale.market', 'market');

    if (filterDto.debtorId) {
      query.andWhere('sale.debtorId = :debtorId', { debtorId: filterDto.debtorId });
    }
    if (filterDto.marketId) {
      query.andWhere('sale.marketId = :marketId', { marketId: filterDto.marketId });
    }
    if (filterDto.isReturned !== undefined) {
      query.andWhere('sale.isReturned = :isReturned', { isReturned: filterDto.isReturned });
    }
    if (filterDto.paymentMethod) {
      query.andWhere('sale.paymentMethod = :paymentMethod', { paymentMethod: filterDto.paymentMethod });
    }
    if (filterDto.minTotalAmount) {
      query.andWhere('sale.totalAmount >= :minTotalAmount', { minTotalAmount: filterDto.minTotalAmount });
    }
    if (filterDto.maxTotalAmount) {
      query.andWhere('sale.totalAmount <= :maxTotalAmount', { maxTotalAmount: filterDto.maxTotalAmount });
    }
    if (filterDto.startDate) {
      query.andWhere('sale.saleDate >= :startDate', { startDate: new Date(filterDto.startDate) });
    }
    if (filterDto.endDate) {
      const endDate = new Date(filterDto.endDate);
      endDate.setHours(23, 59, 59, 999);
      query.andWhere('sale.saleDate <= :endDate', { endDate: endDate });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<SaleResponseDto> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'updatedBy', 'debtor', 'market'],
    });
    if (!sale) {
      throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
    }
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateSaleDto, updatedById: string): Promise<SaleResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.salesRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
      }

      const oldSale = { ...sale }; // Eski ma'lumotlarni saqlash

      // Agar sotuv qaytarilsa (isReturned = true)
      if (updateSaleDto.isReturned === true && sale.isReturned === false) {
        // Omborga mahsulotlarni qaytarish
        for (const item of sale.productsSold) {
          await this.stockService.increaseStockQuantity(item.productId, item.quantity, updatedById);
        }
        // Agar qarzga sotilgan bo'lsa, qarzdorlikni kamaytirish
        if (sale.paymentMethod === 'debt' && sale.debtorId && sale.debtAmount > 0) {
          // Qarzni kamaytirish logikasi: bu yerda qarzni qaytarilgan summa bo'yicha kamaytirish kerak
          // Oddiy holatda, butun sotuv qaytarilsa, uning qarz summasini kamaytiramiz.
          await this.debtorsService.payOffDebt(sale.debtorId, sale.debtAmount, updatedById);
        }
        // Qaytarilgan sotuv uchun qarz summasini 0 ga tenglash
        sale.debtAmount = 0;
        sale.amountPaid = 0; // Qaytarilganda to'langan summa ham 0 bo'ladi deb faraz qilamiz
      } else if (updateSaleDto.isReturned === false && sale.isReturned === true) {
        // Agar qaytarilgan sotuv qayta tiklansa, bu holatni to'g'ri boshqarish kerak.
        // Hozircha bu holatga ruxsat bermaymiz yoki murakkabroq logikani talab qiladi.
        throw new BadRequestException('Qaytarilgan sotuvni qayta tiklash mumkin emas.');
      }

      // To'lov usuli o'zgarganda yoki qarz summasi yangilanganda
      if (updateSaleDto.paymentMethod && updateSaleDto.paymentMethod !== oldSale.paymentMethod) {
        if (oldSale.paymentMethod === 'debt' && oldSale.debtorId && oldSale.debtAmount > 0) {
          // Eski qarzni bekor qilish yoki to'lovga aylantirish
          // Bu yerda qarzni to'liq qoplash yoki qisman to'lash logikasi qo'shilishi mumkin
          // Hozircha faqat qarzni to'liq to'langan deb hisoblaymiz agar paymentMethod o'zgarsa
          await this.debtorsService.payOffDebt(oldSale.debtorId, oldSale.debtAmount, updatedById);
        }
        if (updateSaleDto.paymentMethod === 'debt' && updateSaleDto.debtorId && updateSaleDto.debtAmount > 0) {
          await this.debtorsService.updateDebtorDebt(
            updateSaleDto.debtorId,
            sale.id,
            updateSaleDto.debtAmount,
            updateSaleDto.productsSold || sale.productsSold, // Agar productsSold yangilanmasa, eskisini ishlatish
            updatedById,
          );
        }
      } else if (updateSaleDto.debtAmount !== undefined && updateSaleDto.debtAmount !== oldSale.debtAmount) {
        // Faqat qarz summasi yangilanganda (paymentMethod o'zgarmagan holda)
        if (sale.paymentMethod === 'debt' && sale.debtorId) {
          const debtDifference = updateSaleDto.debtAmount - oldSale.debtAmount;
          if (debtDifference > 0) {
            // Qarz oshirildi
            await this.debtorsService.updateDebtorDebt(
              sale.debtorId,
              sale.id,
              debtDifference,
              updateSaleDto.productsSold || sale.productsSold,
              updatedById,
            );
          } else if (debtDifference < 0) {
            // Qarz kamaytirildi (to'lov amalga oshirildi)
            await this.debtorsService.payOffDebt(sale.debtorId, Math.abs(debtDifference), updatedById);
          }
        }
      }


      Object.assign(sale, updateSaleDto);
      sale.updatedById = updatedById;
      const updatedSale = await queryRunner.manager.save(Sale, sale);

      // Faoliyat jurnaliga yozish
      await this.activityLogService.create({
        action: 'UPDATE_SALE',
        entityType: 'Sale',
        entityId: updatedSale.id,
        details: {
          oldTotalAmount: oldSale.totalAmount,
          newTotalAmount: updatedSale.totalAmount,
          oldPaymentMethod: oldSale.paymentMethod,
          newPaymentMethod: updatedSale.paymentMethod,
          oldIsReturned: oldSale.isReturned,
          newIsReturned: updatedSale.isReturned,
        },
        createdById: updatedById,
      });

      await queryRunner.commitTransaction();

      this.eventsGateway.emitToAll('saleUpdate', updatedSale); // WebSocket orqali yangilanish yuborish
      return updatedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni yangilashda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, removedById: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sale = await this.salesRepository.findOne({ where: { id } });
      if (!sale) {
        throw new NotFoundException(`IDsi ${id} bo'lgan sotuv topilmadi.`);
      }

      // Agar sotuv qaytarilmagan bo'lsa, omborga mahsulotlarni qaytarish
      if (!sale.isReturned) {
        for (const item of sale.productsSold) {
          await this.stockService.increaseStockQuantity(item.productId, item.quantity, removedById);
        }
      }

      // Agar qarzga sotilgan bo'lsa, qarzdorlikni kamaytirish
      if (sale.paymentMethod === 'debt' && sale.debtorId && sale.debtAmount > 0) {
        await this.debtorsService.payOffDebt(sale.debtorId, sale.debtAmount, removedById);
      }

      await queryRunner.manager.remove(Sale, sale);

      await this.activityLogService.create({
        action: 'DELETE_SALE',
        entityType: 'Sale',
        entityId: id,
        details: { totalAmount: sale.totalAmount, paymentMethod: sale.paymentMethod },
        createdById: removedById,
      });

      await queryRunner.commitTransaction();
      this.eventsGateway.emitToAll('saleUpdate', { id, deleted: true }); // WebSocket orqali o'chirilganini bildirish
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Sotuvni o\'chirishda xato:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
EOF

cat << 'EOF' > src/sales/sales.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SaleResponseDto } from './dto/sale-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { Throttle } from '@nestjs/throttler'; // Rate limiting dekoratorini import qilish

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor) // Barcha GET so'rovlari uchun keshni qo'llash
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('admin', 'manager', 'user') // Har qanday roldagi foydalanuvchi sotuv yaratishi mumkin
  @Throttle(5, 60) // 60 sekundda 5 ta so'rov bilan cheklash
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    return this.salesService.create(createSaleDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterSaleDto): Promise<SaleResponseDto[]> {
    return this.salesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<SaleResponseDto> {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    return this.salesService.update(id, updateSaleDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.salesService.remove(id, user.id);
  }
}
EOF

echo "   Modullar, Servislar va Kontrollerlar muvaffaqiyatli yaratildi."
echo ""

echo "=================================================="
echo "  Loyihani o'rnatish yakunlandi!"
echo "=================================================="
echo ""
echo "Keyingi qadamlar:"
echo "1. PostgreSQL ma'lumotlar bazasini o'rnatganingizga va ishlayotganiga ishonch hosil qiling."
echo "2. Redis serverini o'rnatganingizga va ishlayotganiga ishonch hosil qiling."
echo "3. '.env' faylidagi ma'lumotlar bazasi va Redis konfiguratsiyasini o'zingiznikiga moslab o'zgartiring."
echo "   (DB_USERNAME, DB_PASSWORD, DB_DATABASE, REDIS_PASSWORD)"
echo "4. Loyihani ishga tushirish uchun quyidagi buyruqni bajaring:"
echo "   cd $PROJECT_NAME"
echo "   npm run start:dev"
echo ""
echo "Sizga omad tilayman!"
