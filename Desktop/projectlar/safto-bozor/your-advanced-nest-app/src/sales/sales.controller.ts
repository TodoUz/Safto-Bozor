import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SaleResponseDto } from './dto/sale-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterSaleDto } from './dto/filter-sale.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';
import { Throttle } from '@nestjs/throttler'; // Rate limiting dekoratorini import qilish

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor) // Barcha GET so'rovlari uchun keshni qo'llash
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Roles('admin', 'manager', 'user') // Har qanday roldagi foydalanuvchi sotuv yaratishi mumkin
  @Throttle(5, 60) // 60 sekundda 5 ta so'rov bilan cheklash
  async create(
    @Body() createSaleDto: CreateSaleDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    return this.salesService.create(createSaleDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterSaleDto): Promise<SaleResponseDto[]> {
    return this.salesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<SaleResponseDto> {
    return this.salesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @CurrentUser() user: any,
  ): Promise<SaleResponseDto> {
    return this.salesService.update(id, updateSaleDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.salesService.remove(id, user.id);
  }
}
