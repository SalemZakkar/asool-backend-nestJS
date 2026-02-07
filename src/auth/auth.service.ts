import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthSignUpDto } from './dto/auth-sign-up.dto';
import { UserRoleType } from '../user/entities/user-role.type';
import { AuthSignInDto } from './dto/auth-sign-in.dto';
import {
  AuthInvalidTokenException,
  AuthRefreshTokenExpiredException,
  AuthTokenExpiredException,
  AuthWrongCredentialsException,
} from './errors';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { AuthProviderType } from './entities/enum/auth-provider.type';
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

  async signUp(data: AuthSignUpDto) {
    if (data.password != data.confirmPassword) {
      throw new PasswordMissmatchException();
    }
    let res = await this.userService.create(
      {
        type: UserRoleType.User,
        name: data.name,
        email: data.email,
        phone: data.phone,
      },
      { password: data.password },
    );
    return { data: res, ...this.token(res) };
  }

  async signIn(data: AuthSignInDto) {
    let res = await this.userService.findOne({
      email: data.email,
      username: data.username,
    });
    if (!res) {
      throw new AuthWrongCredentialsException();
    }
    let cred = await this.authProvider.findOne({
      where: { user: { id: res.id }, type: AuthProviderType.password },
    });
    if (!cred) {
      throw new AuthWrongCredentialsException();
    }
    if (!(await comparePassword(cred.passwordHash!, data.password))) {
      throw new AuthWrongCredentialsException();
    }
    let jwt = this.token(res);

    return { ...jwt, data: res };
  }

  async refreshToken(refreshToken: string) {
    let res = decodeToken(refreshToken, process.env.JWTR!);
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
    let jwt = this.token(user);
    return { ...jwt, data: user };
  }

  async firebaseLogin(token: string) {
    const decoded = await this.firebase.verify(token);

    const providerType = AuthProviderType.google;

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
        type: UserRoleType.User,
        name: decoded.name ?? 'User',
        email: decoded.email,
      },
      { googleId: decoded.uid }, // no password for firebase users
    );
    const jwt = this.token(user);
    return { ...jwt, data: user };
  }

  token = (params: any) => {
    let jwt = signToken({
      params: { id: params.id, email: params.email },
      expires: '2d',
      key: process.env.JWT!,
    });
    let refresh = signToken({
      params: { id: params.id, email: params.email },
      expires: '30d',
      key: process.env.JWTR!,
    });
    return { accessToken: jwt, refreshToken: refresh };
  };

  async validate(payload: any) {
    let user = await this.userService.findOne({ id: payload.id });
    if (!user) {
      throw new AuthInvalidTokenException();
    }
    return user;
  }
}
