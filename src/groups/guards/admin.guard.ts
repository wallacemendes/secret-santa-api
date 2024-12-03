import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GroupsService } from '../services/groups.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly groupService: GroupsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const groupId = request.params.id;
    const adminKey = request.query.adminKey;

    if (!groupId || !adminKey) {
      throw new UnauthorizedException('Missing group ID or admin key');
    }

    const group = await this.groupService.findgroupById(groupId);
    if (!group || group.adminKey !== adminKey) {
      throw new UnauthorizedException('Invalid admin key');
    }

    request.group = group;
    return true;
  }
}
