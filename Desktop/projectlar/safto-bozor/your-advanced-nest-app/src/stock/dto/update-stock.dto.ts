import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDto } from './create-stock.dto';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateStockDto extends PartialType(CreateStockDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number; // Faqat miqdorni yangilash uchun
}
