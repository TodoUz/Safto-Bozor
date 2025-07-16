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
