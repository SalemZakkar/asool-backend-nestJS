import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { BaseResponse } from 'core';
import { FirebaseLoginDto } from './dto/firebase-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signUp')
  async signUp(@Body(new ValidationPipe()) data: SignUpDto) {
    return new BaseResponse({ ...(await this.authService.signUp(data)) });
  }

  @Post('/signIn')
  async signIn(@Body(new ValidationPipe()) data: SignInDto) {
    return new BaseResponse({ ...(await this.authService.signIn(data)) });
  }

  @Post('/refreshToken')
  async refreshToken(@Body(new ValidationPipe()) data: FirebaseLoginDto) {
    return new BaseResponse({
      ...(await this.authService.refreshToken(data.token)),
    });
  }

  @Post('/firebase')
  async firebase(@Body(new ValidationPipe()) data: FirebaseLoginDto) {
    return new BaseResponse({
      ...(await this.authService.firebaseLogin(data.token)),
    });
  }
}
