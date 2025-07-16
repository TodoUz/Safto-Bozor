import { UserResponseDto } from '../../users/dto/user-response.dto';

class DebtItemResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalItemAmount: number;
  saleId: string;
  debtDate?: Date;
}

export class DebtorResponseDto {
  id: string;
  name: string;
  contactInfo: string;
  currentDebtAmount: number;
  debtItems: DebtItemResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
}
