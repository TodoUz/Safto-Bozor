import { PartialType } from '@nestjs/mapped-types';
import { CreateDebtorDto } from './create-debtor.dto';
import { IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateDebtItemDto {
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

export class UpdateDebtorDto extends PartialType(CreateDebtorDto) {
  @IsOptional()
  @IsNumber()
  currentDebtAmount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateDebtItemDto)
  debtItems?: UpdateDebtItemDto[];
}
