import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { ReadGroupWithoutPhoneNumDto } from '../dto/read-group-without-phone.dto';
import { ParticipantDto } from '../dto/participant.dto';

@Controller('group')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Body() createGroupDto: CreateGroupDto) {
    return await this.groupsService.create(createGroupDto);
  }

  @Get(':id')
  async getGroupInfo(
    @Param('id') id: string,
  ): Promise<ReadGroupWithoutPhoneNumDto> {
    const group = await this.groupsService.findgroupById(id);
    let participants = [];
    if (group.participants) {
      participants = group.participants.map((p) => {
        return {
          name: p.name,
        };
      });
    }

    return {
      groupId: group._id.toHexString(),
      name: group.name,
      description: group.description,
      participants: participants,
    };
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Body() participantDto: ParticipantDto) {
    const group = await this.groupsService.findgroupById(id);
    const groupId: string = group._id.toHexString();
    return await this.groupsService.addParticipant(groupId, participantDto);
  }

  @Get(':id/reveal')
  revealSecretSanta(
    @Param('id') id: string,
    @Query('userKey') userKey: string,
  ) {}
}
