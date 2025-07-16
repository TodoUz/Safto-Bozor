import { IsString, IsOptional } from 'class-validator';

export class CreateMarketDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  contactInfo?: string;
}
