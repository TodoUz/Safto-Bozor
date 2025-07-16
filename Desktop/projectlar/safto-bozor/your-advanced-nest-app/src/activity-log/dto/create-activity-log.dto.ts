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
