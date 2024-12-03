import { IsNotEmpty, IsString } from 'class-validator';

export class ParticipantDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;
}
