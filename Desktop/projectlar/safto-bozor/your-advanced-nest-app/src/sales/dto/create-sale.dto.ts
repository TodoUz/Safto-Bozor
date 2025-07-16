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
