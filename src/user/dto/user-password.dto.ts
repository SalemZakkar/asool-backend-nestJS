import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class UserResetPasswordDto {
  @IsString()
  vid: string;
  @IsString()
  code: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  confirmPassword: string;
}

export class UserForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class UserChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  confirmPassword: string;
}
