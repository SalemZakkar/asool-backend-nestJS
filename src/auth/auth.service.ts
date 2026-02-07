import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpDto } from './dto/sign-up.dto';
import { UserRoleEnum } from '../user/entities/user.role.enum';
import { SignInDto } from './dto/sign-in.dto';
import {
  AuthInvalidTokenException,
  AuthRefreshTokenExpiredException,
  AuthWrongCredentialsException,
} from './errors';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { AuthProviderTypeEnum } from './entities/enum/authprovider.type.enum';
import {
  comparePassword,
  signToken,
  decodeToken,
  PasswordMissmatchException,
} from 'core';
import { FirebaseService } from '../firebase_app/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private readonly userService: UserService,
    @InjectRepository(AuthProvider)
    private readonly authProvider: Repository<AuthProvider>,
    @Inject() private readonly firebase: FirebaseService,
  ) {}

  async signUp(data: SignUpDto) {
    if (data.password != data.confirmPassword) {
      throw new PasswordMissmatchException();
    }
    let res = await this.userService.create(
      {
        type: UserRoleEnum.User,
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      { password: data.password },
    );
    let jwt = signToken({
      params: { id: res!.id, name: res!.name },
      expires: '5d',
      key: process.env.JWT!,
    });
    let refresh = signToken({
      params: { id: res!.id, name: res!.name },
      expires: '30d',
      key: process.env.JWT!,
    });
    return { data: res, accessToken: jwt, refreshToken: refresh };
  }

  async signIn(data: SignInDto) {
    let res = await this.userService.findOne({
      email: data.email,
      username: data.username,
    });
    if (!res) {
      throw new AuthWrongCredentialsException();
    }
    let cred = await this.authProvider.findOne({
      where: { user: { id: res.id }, type: AuthProviderTypeEnum.password },
    });
    if (!cred) {
      throw new AuthWrongCredentialsException();
    }
    if (!(await comparePassword(cred.passwordHash!, data.password))) {
      throw new AuthWrongCredentialsException();
    }
    let jwt = this.token({ id: res.id, name: res.name });

    return { ...jwt, data: res };
  }

  async refreshToken(refreshToken: string) {
    let res = decodeToken(refreshToken, process.env.JWT!);
    if (res.isWrong) {
      throw new AuthInvalidTokenException();
    }
    if (res.isExpired) {
      throw new AuthRefreshTokenExpiredException();
    }
    let { id } = res.data.id;
    let user = await this.userService.findOne({ id: id });
    if (!user) {
      throw new AuthInvalidTokenException();
    }
    let jwt = this.token({ id: user!.id, name: user!.name });
    return { ...jwt, data: user };
  }

  token = (params: any) => {
    let jwt = signToken({
      params: params,
      expires: '5d',
      key: process.env.JWT!,
    });
    let refresh = signToken({
      params: params,
      expires: '30d',
      key: process.env.JWT!,
    });
    return { accessToken: jwt, refreshToken: refresh };
  };

  async firebaseLogin(token: string) {
    const decoded = await this.firebase.verify(token);

    const providerType = AuthProviderTypeEnum.google;

    const existingProvider = await this.authProvider.findOne({
      where: {
        googleAccount: decoded.uid,
        type: providerType,
      },
      relations: ['user'],
    });

    if (existingProvider) {
      const user = existingProvider.user;
      const jwt = this.token({ id: user.id, name: user.name });
      return { ...jwt, data: user };
    }
    const user = await this.userService.create(
      {
        type: UserRoleEnum.User,
        name: decoded.name ?? 'User',
        email: decoded.email,
      },
      {googleId: decoded.uid}, // no password for firebase users
    );
    console.log(user);
    const jwt = this.token({ id: user!.id, name: user!.name });
    return { ...jwt, data: user };
  }
}
