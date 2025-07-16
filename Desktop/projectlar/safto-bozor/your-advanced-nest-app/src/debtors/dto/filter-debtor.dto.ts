import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FilterDebtorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;

  @IsOptional()
  @IsNumber()
  minDebtAmount?: number;

  @IsOptional()
  @IsNumber()
  maxDebtAmount?: number;
}
