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
import { OrValidator, XorValidator } from 'core';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsEnum(UserRoleEnum)
  @IsOptional()
  type: string;
}
