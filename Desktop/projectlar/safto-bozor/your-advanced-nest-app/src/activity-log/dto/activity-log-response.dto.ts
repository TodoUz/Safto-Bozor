import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ActivityLogResponseDto {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, any>;
  timestamp: Date;
  createdBy?: UserResponseDto;
}
