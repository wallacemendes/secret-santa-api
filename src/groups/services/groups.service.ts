import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../entities/group.entity';
import { MongoRepository } from 'typeorm';
import { randomBytes } from 'crypto';
import { ObjectId } from 'mongodb';
import { CreateGroupReponseDto } from '../dto/create-group-response.dto';
import { ParticipantDto } from '../dto/participant.dto';
import { Participant } from '../entities/participant.entity';
import { AddParticipantResponseDto } from '../dto/add-participant-response.dto';
import { ReadGroupInfoDto } from '../dto/read-group-info.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: MongoRepository<Group>,
  ) {}

  private generateRandomKey(length: number): string {
    return randomBytes(length).toString('hex');
  }
  private getRandomIndex(arrayLength: number): number {
    return Math.floor(Math.random() * arrayLength);
  }

  async create(createGroupDto: CreateGroupDto): Promise<CreateGroupReponseDto> {
    try {
      const adminKey = this.generateRandomKey(6);
      const group: Group = this.groupRepository.create({
        ...createGroupDto,
        adminKey: adminKey,
      });
      const savedGroup = this.groupRepository.save(group);
      const responseBody: CreateGroupReponseDto = {
        groupId: (await savedGroup)._id,
        adminKey: (await savedGroup).adminKey,
        group: {
          name: (await savedGroup).name,
          description: (await savedGroup).description,
        },
        message:
          "The 'adminKey' is displayed only once. Save it securely for administrative operations.",
      };

      return responseBody;
    } catch (error) {
      if (error.message.includes('connection')) {
        throw new InternalServerErrorException('Database connection error.');
      }
      throw error;
    }
  }

  async addParticipant(
    id: string,
    participantDto: ParticipantDto,
  ): Promise<AddParticipantResponseDto> {
    try {
      const group = await this.findgroupById(id);

      if (!group.participants) Object.assign(group, { participants: [] });

      const isDuplicate = group.participants.some(
        (p) => p.phoneNumber === participantDto.phoneNumber,
      );
      if (isDuplicate) {
        throw new ConflictException(
          'A participant with the same phoneNumber is already in the group.',
        );
      }
      const key = this.generateRandomKey(4);
      const newParticipant: Participant = {
        ...participantDto,
        key: key,
      };
      group.participants.push(newParticipant);
      await this.groupRepository.save(group);

      return {
        groupId: group._id.toString('hex'),
        groupName: group.name,
        message: 'Success! Save the "key" for consulting secret santa.',
        participant: newParticipant,
      };
    } catch (error) {
      if (error.message.includes('connection')) {
        throw new InternalServerErrorException('Database connection error.');
      }
      throw error;
    }
  }

  async findgroupById(id: string): Promise<Group> {
    const validateId = ObjectId.isValid(id);
    if (!validateId)
      throw new BadRequestException('The provided ID is not valid.');

    const objectId = new ObjectId(id);
    const group = await this.groupRepository.findOneBy({ _id: objectId });

    if (!group)
      throw new NotFoundException(
        `The group with ID ${id} could not be found.`,
      );

    return group;
  }

  async update(
    id: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<ReadGroupInfoDto> {
    const group = await this.findgroupById(id);
    Object.assign(group, updateGroupDto);
    await this.groupRepository.save(group);

    const responseBody: ReadGroupInfoDto = {
      groupId: group._id.toHexString(),
      name: group.name,
      description: group.description,
      participants: group.participants.map((p) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { key: _, ...participant } = p;
        return participant;
      }),
    };

    return responseBody;
  }

  async removeParticipant(id: string, phone: string) {
    const group = await this.findgroupById(id);
    const participants = group.participants;
    if (!participants || participants.length === 0) {
      throw new NotFoundException('The group does not have any participant.');
    }
    const participantExists = group.participants.some(
      (p) => p.phoneNumber === phone,
    );

    if (!participantExists)
      throw new NotFoundException(
        'Participant with the provided phoneNumber does not exists.',
      );

    const remainingParticipants = group.participants.filter(
      (p) => p.phoneNumber !== phone,
    );

    await this.groupRepository.updateOne(
      { _id: new ObjectId(id) },
      { $set: { participants: remainingParticipants } },
    );

    return {
      status: 'Success',
      message: `Participant with phoneNumber: ${phone} removed.`,
    };
  }

  async deleteGroup(id: string) {
    try {
      const group = await this.findgroupById(id);
      await this.groupRepository.remove(group);
      return {
        status: 'Success',
        message: `The group with ID: ${id} was deleted.`,
      };
    } catch (error) {
      if (error.message.includes('connection')) {
        throw new InternalServerErrorException('Database connection error.');
      }
      throw error;
    }
  }

  async draw(id: string) {
    const group = await this.findgroupById(id);
    if (!group.participants && group.participants.length < 2) {
      throw new Error('The group has not enough participants to draw.');
    }

    if (!group.draws) Object.assign(group, { draws: {} });

    type ParticipantNoKey = Omit<Participant, 'key'>;
    const participants: ParticipantNoKey[] = group.participants.map((p) => {
      return {
        name: p.name,
        phoneNumber: p.phoneNumber,
      };
    });
    const randomIndex = this.getRandomIndex(participants.length);
    const firstSelected = participants[randomIndex];
    participants.splice(randomIndex, 1);

    const assignParticipant = (
      giver: ParticipantNoKey,
      remainingParticipants: ParticipantNoKey[],
    ) => {
      const receiverIndex = this.getRandomIndex(remainingParticipants.length);
      const receiver = remainingParticipants[receiverIndex];

      group.draws[giver.name] = {
        ...receiver,
      };
      remainingParticipants.splice(receiverIndex, 1);

      if (remainingParticipants.length === 0) {
        group.draws[receiver.name] = {
          ...firstSelected,
        };
        return;
      }
      assignParticipant(receiver, remainingParticipants);
    };

    assignParticipant(firstSelected, participants);
    return group.draws;
  }
}
