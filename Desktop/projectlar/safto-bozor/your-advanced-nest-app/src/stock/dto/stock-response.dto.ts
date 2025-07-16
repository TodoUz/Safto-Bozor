import { UserResponseDto } from '../../users/dto/user-response.dto';

export class StockResponseDto {
  id: string;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
