import { OmitType } from '@nestjs/mapped-types';
import { ParticipantDto } from './participant.dto';
import { ReadGroupInfoDto } from './read-group-info.dto';

export class ReadGroupWithoutPhoneNumDto extends OmitType(ReadGroupInfoDto, [
  'participants',
]) {
  readonly participants: Pick<ParticipantDto, 'name'>[];
}
