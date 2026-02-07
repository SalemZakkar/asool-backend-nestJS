import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Req,
  UseGuards,
  Get,
  Patch,
  UsePipes,
  Query,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { BaseResponse, PasswordMissmatchException } from 'core';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import {
  UserForgotPasswordDto,
  UserResetPasswordDto,
} from './dto/user-password.dto';
import { UserVerifyDto } from './dto/user-verify.dto';
import { UserChangePasswordDto } from './dto/userChangePasswordDto';
import { UpdateMineDto } from './dto/update-mine.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FirebaseLoginDto } from '../auth/dto/firebase-login.dto';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  //get All  update By Id

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  async getMine(@Req() req: Request) {
    return new BaseResponse({ data: req.user });
  }

  @Patch('/mine')
  @UseGuards(AuthGuard('jwt'))
  async updateMine(
    @Req() req: Request,
    @Body()
    data: UpdateMineDto,
  ) {
    console.log(data);
    let res = await this.userService.findOneAndUpdate(
      data,
      (req.user as User).id,
    );
    return new BaseResponse({ data: res });
  }

  @Post('/mine/changePassword')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(
    @Body() params: UserChangePasswordDto,
    @Req() req: Request,
  ) {
    if (params.password != params.confirmPassword) {
      throw new PasswordMissmatchException();
    }
    await this.userService.setPassword((req.user as User).id, params.password);
    return new BaseResponse({});
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/mine/sendEmailOtp')
  async requestEmailVerification(@Req() req: Request) {
    return await this.userService.sendEmailOtp({
      userId: (req.user as User).id,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/mine/verifyEmail')
  async verifyEmail(@Body() params: UserVerifyDto, @Req() req: Request) {
    let res = await this.userService.verifyEmail(
      params.vid,
      params.code,
      (req.user as User).id,
    );
    return new BaseResponse({ data: res });
  }

  @Post('/mine/forgotPassword')
  async forgotPassword(@Body() params: UserForgotPasswordDto) {
    return await this.userService.forgotPassword({ email: params.email });
  }

  @Post('/mine/resetPassword')
  async resetPassword(@Body() params: UserResetPasswordDto) {
    await this.userService.resetPassword(
      params.vid,
      params.code,
      params.password,
    );
    return new BaseResponse({ message: 'Password Reset Success' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/mine/google')
  async googleLink(@Body() data: FirebaseLoginDto, @Req() req: Request) {
    await this.userService.linkGoogleAccount((req.user as User).id, data.token);
    return new BaseResponse({ message: 'Linked Google Account' });
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/mine/google')
  async googleUnLink(@Req() req: Request) {
    await this.userService.unlinkGoogleAccount((req.user as User).id);
    return new BaseResponse({ message: 'Un Linked Google Account' });
  }
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return new BaseResponse({
      data: await this.userService.create(
        {
          type: createUserDto.type,
          username: createUserDto.username,
          email: createUserDto.email,
          isEmailVerified: false,
          name: createUserDto.name,
          phone: createUserDto.phone,
        },
        { password: createUserDto.password },
      ),
    });
  }

  @Get()
  async getByCriteria(@Query() req: any) {
    console.log(req);
    return new BaseResponse();
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    let res = await this.userService.findOne({ id: id });
    return new BaseResponse({ data: res });
  }

  @Patch('/:id')
  async updateById(@Param('id') id: string, @Body() data: UpdateUserDto) {
    let res = await this.userService.findOneAndUpdate(data, id);
    return new BaseResponse({ data: res });
  }

  @Post('/changePassword/:id')
  async changeUserPassword(
    @Param('id') id: string,
    @Body() data: UserChangePasswordDto,
  ) {
    if (data.password != data.confirmPassword) {
      throw new PasswordMissmatchException();
    }
    let res = await this.userService.setPassword(id, data.password);
    return new BaseResponse({ data: res });
  }
}
