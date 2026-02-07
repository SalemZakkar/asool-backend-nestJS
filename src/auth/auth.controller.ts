import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthSignUpDto } from './dto/auth-sign-up.dto';
import { AuthSignInDto } from './dto/auth-sign-in.dto';
import { BaseResponse } from 'core';
import { AuthTokenDto } from './dto/auth-token.dto';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AuthController {
  constructor(private readonly authService: AuthService) {
  }
  @Post('/signUp')
  async signUp(@Body() data: AuthSignUpDto) {
    return new BaseResponse({ ...(await this.authService.signUp(data)) });
  }

  @Post('/signIn')
  async signIn(@Body() data: AuthSignInDto) {
    return new BaseResponse({ ...(await this.authService.signIn(data)) });
  }

  @Post('/refreshToken')
  async refreshToken(@Body() data: AuthTokenDto) {
    return new BaseResponse({
      ...(await this.authService.refreshToken(data.token)),
    });
  }

  @Post('/firebase')
  async firebase(@Body() data: AuthTokenDto) {
    return new BaseResponse({
      ...(await this.authService.firebaseLogin(data.token)),
    });
  }
}
