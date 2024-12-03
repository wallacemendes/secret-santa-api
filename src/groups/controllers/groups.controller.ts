import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { ReadGroupWithoutPhoneNumDto } from '../dto/read-group-without-phone.dto';

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

    return {
      groupId: group._id.toHexString(),
      name: group.name,
      description: group.description,
      participants: group.participants.map((p) => {
        return {
          name: p.name,
        };
      }),
    };
  }

  @Put(':id')
  join(@Param('id') id: string) {}

  @Get(':id/reveal')
  revealSecretSanta(
    @Param('id') id: string,
    @Query('userKey') userKey: string,
  ) {}
}
