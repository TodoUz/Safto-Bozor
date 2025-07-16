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
