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
