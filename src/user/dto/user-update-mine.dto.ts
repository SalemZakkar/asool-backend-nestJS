import { IsEnum, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { UserRoleType } from '../entities/user-role.type';

export class UserUpdateMineDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
}

export class UserUpdateDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsEnum(UserRoleType)
  @IsOptional()
  type: string;
}
