import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class SignInDto {
  @ValidateIf((o) => !o.username) // run email validation if username not present
  @IsString()
  @IsEmail()
  email?: string;
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @ValidateIf((o) => !o.email) // run username validation if email not present
  @MinLength(3)
  @MaxLength(20)
  username?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  password: string;
}
