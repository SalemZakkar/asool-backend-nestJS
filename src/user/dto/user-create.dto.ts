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
import { UserRoleType } from '../entities/user-role.type';
import { XorValidator } from 'core';

export class UserCreateDto {
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
  @IsEnum(UserRoleType)
  type: string;

  @Validate(XorValidator, ['email', 'username'])
  x: any;
}
