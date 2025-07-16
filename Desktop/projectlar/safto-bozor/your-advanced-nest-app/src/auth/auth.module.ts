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
