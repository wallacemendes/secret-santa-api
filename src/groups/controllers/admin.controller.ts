import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { ParticipantDto } from '../dto/participant.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { ResponseDto } from '../dto/status-response.dto';

@UseGuards(AdminGuard)
@Controller('group/:id/admin')
export class AdminController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post('add-participant')
  async addParticipant(@Req() request, @Body() participantDto: ParticipantDto) {
    const groupId: string = request.group._id;
    return await this.groupsService.addParticipant(groupId, participantDto);
  }

  @Delete('participants/:phone')
  async deleteParticipant(@Req() request, @Param('phone') phone: string) {
    return await this.groupsService.removeParticipant(request.group._id, phone);
  }

  @Get('participants')
  async getAllParticipants(@Req() request): Promise<ParticipantDto[]> {
    const group = await this.groupsService.findgroupById(request.group._id);
    if (!group.participants) {
      throw new NotFoundException('The group has not participants.');
    }
    return group.participants;
  }

  @Put('draw')
  async draw(
    @Req() request,
    @Query('forceDraw') forceDraw: boolean,
  ): Promise<ResponseDto<object>> {
    try {
      const id: string = request.group._id;
      const group = await this.groupsService.findgroupById(id);
      if (group.draws && !forceDraw) {
        return {
          success: true,
          data: group.draws,
        };
      }
      const draws = await this.groupsService.draw(id);
      const responseBody: ResponseDto<object> = {
        success: true,
        data: draws,
      };

      return responseBody;
    } catch (error) {
      return {
        success: false,
        errors: error.message,
      };
    }
  }

  @Patch('edit')
  update(@Req() request, @Body() updateGroupDto: UpdateGroupDto) {
    const id = request.group._id;
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete('delete')
  deleteGroup(@Req() request, @Query('confirmDelete') confirm: boolean) {
    if (!confirm)
      throw new BadRequestException(
        'The delete operation is missing a "confirmDelete" query',
      );
    const id = request.group._id;
    return this.groupsService.deleteGroup(id);
  }
}
