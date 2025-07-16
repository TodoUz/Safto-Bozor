import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(createActivityLogDto: CreateActivityLogDto): Promise<ActivityLogResponseDto> {
    const newLog = this.activityLogRepository.create(createActivityLogDto);
    return this.activityLogRepository.save(newLog);
  }

  async findAll(filterDto: FilterActivityLogDto): Promise<ActivityLogResponseDto[]> {
    const query = this.activityLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.createdBy', 'user'); // Yaratuvchi foydalanuvchini yuklash

    if (filterDto.action) {
      query.andWhere('log.action ILIKE :action', { action: `%${filterDto.action}%` });
    }
    if (filterDto.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filterDto.entityType });
    }
    if (filterDto.entityId) {
      query.andWhere('log.entityId = :entityId', { entityId: filterDto.entityId });
    }
    if (filterDto.createdById) {
      query.andWhere('log.createdById = :createdById', { createdById: filterDto.createdById });
    }
    if (filterDto.startDate) {
      query.andWhere('log.timestamp >= :startDate', { startDate: new Date(filterDto.startDate) });
    }
    if (filterDto.endDate) {
      const endDate = new Date(filterDto.endDate);
      endDate.setHours(23, 59, 59, 999); // Kun oxirigacha
      query.andWhere('log.timestamp <= :endDate', { endDate: endDate });
    }

    query.orderBy('log.timestamp', 'DESC'); // Eng yangilarini birinchi ko'rsatish

    return query.getMany();
  }

  async findOne(id: string): Promise<ActivityLogResponseDto> {
    const log = await this.activityLogRepository.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!log) {
      throw new NotFoundException(`IDsi ${id} bo'lgan faoliyat jurnali topilmadi.`);
    }
    return log;
  }
}
