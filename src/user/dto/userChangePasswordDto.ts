import { IsString, MaxLength, MinLength } from 'class-validator';

export class UserChangePasswordSto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  confirmPassword: string;
}
