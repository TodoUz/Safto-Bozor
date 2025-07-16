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
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MarketResponseDto } from './dto/market-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterMarketDto } from './dto/filter-market.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('markets')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createMarketDto: CreateMarketDto,
    @CurrentUser() user: any,
  ): Promise<MarketResponseDto> {
    return this.marketsService.create(createMarketDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterMarketDto): Promise<MarketResponseDto[]> {
    return this.marketsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<MarketResponseDto> {
    return this.marketsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateMarketDto: UpdateMarketDto,
    @CurrentUser() user: any,
  ): Promise<MarketResponseDto> {
    return this.marketsService.update(id, updateMarketDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.marketsService.remove(id, user.id);
  }
}
