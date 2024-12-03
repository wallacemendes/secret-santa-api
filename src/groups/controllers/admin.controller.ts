import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { ParticipantDto } from '../dto/participant.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UpdateGroupDto } from '../dto/update-group.dto';

@UseGuards(AdminGuard)
@Controller('group/:id/admin')
export class AdminController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('add-participant')
  async addParticipant(@Req() request, @Body() participantDto: ParticipantDto) {
    const groupId: string = request.group._id;
    return await this.groupsService.addParticipant(groupId, participantDto);
  }

  @Delete(':phone')
  deleteParticipant(@Req() request, @Param('phone') phone: string) {}

  @Get()
  getAllParticipants(@Req() request) {}

  @Put('draw')
  draw(@Req() request) {}

  @Patch('edit')
  update(@Req() request, @Body() updateGroupDto: UpdateGroupDto) {
    const id = request.group._id;
    return this.groupsService.update(id, updateGroupDto);
  }
}
