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
