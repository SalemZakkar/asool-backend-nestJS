import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { UserRoleEnum } from '../entities/user.role.enum';
import { XorValidator } from 'core';

export class CreateUserDto {
  @IsString()
  name: string;
  @IsString()
  @IsOptional()
  username?: string;
  @IsEmail()
  @IsOptional()
  email?: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  @IsEnum(UserRoleEnum)
  type: string;

  @Validate(XorValidator, ['email', 'username'])
  x: any;
}
