import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @IsOptional()
  @IsBoolean()
  isReturned?: boolean;

  @IsOptional()
  @IsNumber()
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  debtAmount?: number;

  @IsOptional()
  @IsEnum(['cash', 'card', 'debt'])
  paymentMethod?: 'cash' | 'card' | 'debt';
}
