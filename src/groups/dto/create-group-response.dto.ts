import { ObjectId } from 'mongodb';
import { Group } from '../entities/group.entity';

export class CreateGroupReponseDto {
  readonly groupId: ObjectId;
  readonly adminKey: string;
  readonly message: string;
  readonly group: Partial<Group>;
}
