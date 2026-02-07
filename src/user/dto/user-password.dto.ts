import { IsString } from 'class-validator';

class UserVerifyDto {
  @IsString()
  vid: string;
  @IsString()
  code: string;
}
