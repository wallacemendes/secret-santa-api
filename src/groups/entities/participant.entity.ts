import { Column } from 'typeorm';

export class Participant {
  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  key: string;
}
