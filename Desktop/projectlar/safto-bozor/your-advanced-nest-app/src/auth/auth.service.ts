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
