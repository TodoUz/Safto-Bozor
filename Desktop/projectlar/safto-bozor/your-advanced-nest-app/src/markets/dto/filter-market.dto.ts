import { IsString, IsOptional } from 'class-validator';

export class FilterMarketDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
