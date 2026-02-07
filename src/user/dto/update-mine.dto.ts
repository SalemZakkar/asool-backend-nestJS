import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateMineDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
}
