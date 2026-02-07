import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateMineDto {
  @IsString()
  @IsOptional()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
}
