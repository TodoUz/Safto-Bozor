import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateStockDto {
  @IsString()
  productName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;
}
