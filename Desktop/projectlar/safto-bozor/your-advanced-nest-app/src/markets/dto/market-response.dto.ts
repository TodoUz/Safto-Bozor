import { UserResponseDto } from '../../users/dto/user-response.dto';

export class MarketResponseDto {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
