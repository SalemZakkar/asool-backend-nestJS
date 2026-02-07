import { IsString } from 'class-validator';

export class UserVerifyDto {
  @IsString()
  vid: string;
  @IsString()
  code: string;
}
