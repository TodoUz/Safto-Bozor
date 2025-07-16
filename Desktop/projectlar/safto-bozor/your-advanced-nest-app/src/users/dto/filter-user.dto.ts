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
