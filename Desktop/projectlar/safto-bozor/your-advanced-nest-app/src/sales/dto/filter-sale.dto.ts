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
