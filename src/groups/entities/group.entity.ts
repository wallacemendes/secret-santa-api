import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { Participant } from './participant.entity';

@Entity('groups')
export class Group {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  adminKey: string;

  @Column(() => Participant)
  participants?: Participant[];

  @Column({ default: {} })
  draws: { [key: string]: Omit<Participant, 'key'> };
}
