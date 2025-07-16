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
import { DebtorsService } from './debtors.service';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DebtorResponseDto } from './dto/debtor-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FilterDebtorDto } from './dto/filter-debtor.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('debtors')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class DebtorsController {
  constructor(private readonly debtorsService: DebtorsService) {}

  @Post()
  @Roles('admin', 'manager')
  async create(
    @Body() createDebtorDto: CreateDebtorDto,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.create(createDebtorDto, user.id);
  }

  @Get()
  @Roles('admin', 'manager', 'user')
  async findAll(@Query() filterDto: FilterDebtorDto): Promise<DebtorResponseDto[]> {
    return this.debtorsService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager', 'user')
  async findOne(@Param('id') id: string): Promise<DebtorResponseDto> {
    return this.debtorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateDebtorDto: UpdateDebtorDto,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.update(id, updateDebtorDto, user.id);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.debtorsService.remove(id, user.id);
  }

  @Post(':id/pay-debt')
  @Roles('admin', 'manager', 'user') // Har qanday rol to'lashi mumkin
  async payOffDebt(
    @Param('id') id: string,
    @Body('amountPaid') amountPaid: number,
    @CurrentUser() user: any,
  ): Promise<DebtorResponseDto> {
    return this.debtorsService.payOffDebt(id, amountPaid, user.id);
  }
}
