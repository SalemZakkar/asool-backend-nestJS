import {
  IsString,
} from 'class-validator';

export class FirebaseLoginDto {
  @IsString()
  token: string;
}
