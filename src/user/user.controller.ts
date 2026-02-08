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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user-create.dto';
import { BaseResponse, PasswordMissmatchException } from 'core';
import { Request } from 'express';
import { User } from './entities/user.entity';
import {
  UserChangePasswordDto,
  UserForgotPasswordDto,
  UserResetPasswordDto,
} from './dto/user-password.dto';
import { UserVerifyDto } from './dto/user-verify.dto';
import { UserUpdateDto, UserUpdateMineDto } from './dto/user-update-mine.dto';
import { AuthTokenDto } from '../auth';
import { JwtGuard } from '../auth';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe, ImageFileValidatorPipeline } from '../file';

@Controller('user')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  //get All

  @Get('/mine')
  @UseGuards(JwtGuard)
  async getMine(@Req() req: Request) {
    return new BaseResponse({ data: req.user });
  }

  @Patch('/mine')
  @UseGuards(JwtGuard)
  async updateMine(
    @Req() req: Request,
    @Body()
    data: UserUpdateMineDto,
  ) {
    let res = await this.userService.findOneAndUpdate(
      data,
      (req.user as User).id,
    );
    return new BaseResponse({ data: res });
  }

  @Post('/mine/image')
  @UseGuards(JwtGuard)
  @UseInterceptors(FileInterceptor('image'))
  async photo(
    @UploadedFile(new ImageFileValidatorPipeline())
    image: Express.Multer.File,
    @Req() req: Request,
  ) {
    return new BaseResponse({
      data: await this.userService.savePhoto(image, (req.user as User).id),
    });
  }

  @Delete('/mine/image')
  @UseGuards(JwtGuard)
  async deletePhoto(@Req() req: Request) {
    return new BaseResponse({
      data: await this.userService.deletePhoto((req.user as User).id),
    });
  }

  @Post('/mine/changePassword')
  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Post('/mine/sendEmailOtp')
  async requestEmailVerification(@Req() req: Request) {
    return await this.userService.sendEmailOtp({
      userId: (req.user as User).id,
    });
  }

  @UseGuards(JwtGuard)
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

  @UseGuards(JwtGuard)
  @Post('/mine/google')
  async googleLink(@Body() data: AuthTokenDto, @Req() req: Request) {
    await this.userService.linkGoogleAccount((req.user as User).id, data.token);
    return new BaseResponse({ message: 'Linked Google Account' });
  }

  @UseGuards(JwtGuard)
  @Delete('/mine/google')
  async googleUnLink(@Req() req: Request) {
    await this.userService.unlinkGoogleAccount((req.user as User).id);
    return new BaseResponse({ message: 'Un Linked Google Account' });
  }
  @Post()
  async create(@Body() createUserDto: UserCreateDto) {
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
    return new BaseResponse();
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    let res = await this.userService.findOne({ id: id });
    return new BaseResponse({ data: res });
  }

  @Patch('/:id')
  async updateById(@Param('id') id: string, @Body() data: UserUpdateDto) {
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
