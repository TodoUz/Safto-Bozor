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
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StockResponseDto } from './dto/stock-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterStockDto } from './dto/filter-stock.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createStockDto: CreateStockDto,
    @CurrentUser() user: any,
  ): Promise<StockResponseDto> {
    return this.stockService.create(createStockDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterStockDto): Promise<StockResponseDto[]> {
    return this.stockService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<StockResponseDto> {
    return this.stockService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateStockDto: UpdateStockDto,
    @CurrentUser() user: any,
  ): Promise<StockResponseDto> {
    return this.stockService.update(id, updateStockDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.stockService.remove(id, user.id);
  }
}
