import { ParticipantDto } from './participant.dto';

export class ReadGroupInfoDto {
  readonly groupId: string;
  readonly name: string;
  readonly description: string;
  readonly participants: ParticipantDto[];
}
