import { Participant } from '../entities/participant.entity';

export class AddParticipantResponseDto {
  readonly groupId: string;
  readonly groupName: string;
  readonly message: string;
  readonly participant: Participant;
}
