import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from './entities/market.entity';
import { CreateMarketDto } from './dto/create-market.dto';
import { UpdateMarketDto } from './dto/update-market.dto';
import { MarketResponseDto } from './dto/market-response.dto';
import { FilterMarketDto } from './dto/filter-market.dto';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
    private activityLogService: ActivityLogService,
  ) {}

  async create(createMarketDto: CreateMarketDto, createdById: string): Promise<MarketResponseDto> {
    const existingMarket = await this.marketsRepository.findOne({ where: { name: createMarketDto.name } });
    if (existingMarket) {
      throw new BadRequestException('Ushbu nomdagi bozor allaqachon mavjud.');
    }

    const newMarket = this.marketsRepository.create({ ...createMarketDto, createdById });
    const savedMarket = await this.marketsRepository.save(newMarket);

    await this.activityLogService.create({
      action: 'CREATE_MARKET',
      entityType: 'Market',
      entityId: savedMarket.id,
      details: { name: savedMarket.name, address: savedMarket.address },
      createdById: createdById,
    });

    return savedMarket;
  }

  async findAll(filterDto: FilterMarketDto): Promise<MarketResponseDto[]> {
    const query = this.marketsRepository.createQueryBuilder('market');

    if (filterDto.name) {
      query.andWhere('market.name ILIKE :name', { name: `%${filterDto.name}%` });
    }
    if (filterDto.address) {
      query.andWhere('market.address ILIKE :address', { address: `%${filterDto.address}%` });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<MarketResponseDto> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }
    return market;
  }

  async update(id: string, updateMarketDto: UpdateMarketDto, updatedById: string): Promise<MarketResponseDto> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }

    const oldMarket = { ...market };

    Object.assign(market, updateMarketDto);
    market.updatedById = updatedById;
    const updatedMarket = await this.marketsRepository.save(market);

    await this.activityLogService.create({
      action: 'UPDATE_MARKET',
      entityType: 'Market',
      entityId: updatedMarket.id,
      details: {
        oldName: oldMarket.name,
        newName: updatedMarket.name,
        oldAddress: oldMarket.address,
        newAddress: updatedMarket.address,
      },
      createdById: updatedById,
    });

    return updatedMarket;
  }

  async remove(id: string, removedById: string): Promise<void> {
    const market = await this.marketsRepository.findOne({ where: { id } });
    if (!market) {
      throw new NotFoundException(`IDsi ${id} bo'lgan bozor topilmadi.`);
    }
    await this.marketsRepository.remove(market);

    await this.activityLogService.create({
      action: 'DELETE_MARKET',
      entityType: 'Market',
      entityId: id,
      details: { name: market.name },
      createdById: removedById,
    });
  }
}
