import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsString()
  name: string;
  @IsPhoneNumber()
  phoneNumber: string;
}
