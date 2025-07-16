import { UserResponseDto } from '../../users/dto/user-response.dto';
import { DebtorResponseDto } from '../../debtors/dto/debtor-response.dto';
import { MarketResponseDto } from '../../markets/dto/market-response.dto';

class ProductSoldResponseDto {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalItemAmount: number;
}

export class SaleResponseDto {
  id: string;
  productsSold: ProductSoldResponseDto[];
  totalAmount: number;
  amountPaid: number;
  debtAmount: number;
  paymentMethod: string;
  isReturned: boolean;
  saleDate: Date;
  updatedAt: Date;
  createdBy?: UserResponseDto;
  updatedBy?: UserResponseDto;
  debtor?: DebtorResponseDto;
  market?: MarketResponseDto;
}
