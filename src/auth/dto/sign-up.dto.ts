import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsPhoneNumber,
  IsOptional
} from 'class-validator';

export class SignUpDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  confirmPassword: string;
  @IsString()
  name: string;
  @IsPhoneNumber()
  @IsOptional()
  phone: string;
}
