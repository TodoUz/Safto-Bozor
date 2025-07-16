import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { FilterActivityLogDto } from './dto/filter-activity-log.dto';
import { HttpCacheInterceptor } from '../common/interceptors/cache.interceptor';

@Controller('activity-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(HttpCacheInterceptor)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles('admin', 'manager') // Faqat 'admin' va 'manager' ko'rishi mumkin
  async findAll(@Query() filterDto: FilterActivityLogDto): Promise<ActivityLogResponseDto[]> {
    return this.activityLogService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('admin', 'manager')
  async findOne(@Param('id') id: string): Promise<ActivityLogResponseDto> {
    return this.activityLogService.findOne(id);
  }
}
