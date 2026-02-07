import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOperator, IsNull, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword } from 'core';
import {
  UserAlreadyExistsException,
  UserAlreadyVerifiedException,
  UserActionNeedsPassword,
  UserIsNotActivatedException,
} from './errors';
import { AuthProvider } from '../auth/entities/auth.entity';
import { AuthProviderTypeEnum } from '../auth/entities/enum/authprovider.type.enum';
import { OtpService } from '../otp/otp.service';
import { OtpChannelEnum } from '../otp/entity/enum/otpchannel.enum';
import { UpdateMineDto } from './dto/update-mine.dto';
import { Otp } from '../otp/entity/otp.entity';
import { OtpReasonEnum } from '../otp/entity/enum/otpreason.enum';
import { FirebaseService } from '../firebase_app/firebase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    @Inject() private readonly otpService: OtpService,
    @Inject() private readonly firebase: FirebaseService,
    private readonly ds: DataSource,
  ) {}

  async create(
    user: Partial<User>,
    credentials: { googleId?: string; password?: string },
  ) {
    return await this.ds.transaction(async (manager) => {
      let authRepo = manager.getRepository(AuthProvider);
      let userRepo = manager.getRepository(User);
      if (
        await userRepo.exists({
          where: { email: user.email, username: user.username },
        })
      ) {
        throw new UserAlreadyExistsException();
      }
      let userCreated = await userRepo.save(user);
      if (credentials.googleId) {
        userCreated.isEmailVerified = true;
        await authRepo.save({
          user: { id: userCreated.id },
          type: AuthProviderTypeEnum.google,
          googleAccount: credentials.googleId,
        });
      } else {
        let password = await hashPassword(credentials.password!, 10);
        await authRepo.save({
          user: { id: userCreated.id },
          type: AuthProviderTypeEnum.password,
          passwordHash: password,
        });
      }
      return userCreated;
    });
  }

  async find(params?: Partial<User>) {
    return this.repo.find({
      where: {
        name: new FindOperator('equal', 'likij'),
      },
    });
  }

  async findOne(params: Partial<User>) {
    return this.repo.findOne({ where: params });
  }

  async findOneAndUpdate(params: Partial<User> | UpdateMineDto, id: string) {
    let user = await this.repo.findOneBy({ id: id });
    if (!user) {
      throw new NotFoundException();
    }
    let k = this.repo.merge(user, params);
    return await this.repo.save(k);
  }

  async setPassword(id: string, password: string) {
    await this.ds.transaction(async (manager) => {
      const authRepo = manager.getRepository(AuthProvider);
      let auth = await authRepo.findOne({
        where: { user: { id: id }, type: AuthProviderTypeEnum.password },
      });
      if (auth) {
        auth.passwordHash = await hashPassword(password, 10); // use your comparePassword/ hash function
      } else {
        auth = authRepo.create({
          user: { id: id },
          type: AuthProviderTypeEnum.password,
          passwordHash: await hashPassword(password, 10),
        });
      }
      await authRepo.save(auth);
    });
  }

  async linkGoogleAccount(userId: string, token: string) {
    await this.ds.transaction(async (manager) => {
      let google = await this.firebase.verify(token);
      let googleAccount = google.uid;
      const authRepo = manager.getRepository(AuthProvider);
      let auth = await authRepo.findOne({
        where: { user: { id: userId }, type: AuthProviderTypeEnum.google },
      });
      if (auth) {
        auth.googleAccount = googleAccount;
      } else {
        auth = authRepo.create({
          user: { id: userId },
          type: AuthProviderTypeEnum.google,
          googleAccount: googleAccount,
        });
      }
      await authRepo.save(auth);
    });
  }

  async unlinkGoogleAccount(userId: string) {
    await this.ds.transaction(async (manager) => {
      const authRepo = manager.getRepository(AuthProvider);
      const passwordAuth = await authRepo.findOne({
        where: { user: { id: userId }, type: AuthProviderTypeEnum.password },
      });
      if (!passwordAuth) {
        throw new UserActionNeedsPassword();
      }
      await authRepo.delete({
        user: { id: userId },
        type: AuthProviderTypeEnum.google,
      });
    });
  }

  async sendEmailOtp(params: { userId: string }) {
    const r = await this.repo.exists({
      where: [
        { id: params.userId, username: Not(IsNull()) },
        { id: params.userId, isEmailVerified: true, email: Not(IsNull()) },
      ],
    });
    if (r) {
      throw new UserAlreadyVerifiedException();
    }
    return await this.otpService.createOtp({
      userId: params.userId,
      channel: OtpChannelEnum.Email,
      reason: OtpReasonEnum.Verify,
    });
  }

  async forgotPassword(params: { email: string }) {
    let user = await this.repo.findOne({ where: { email: params.email } });
    if (!user) {
      throw new NotFoundException();
    }
    if (!user.isEmailVerified) {
      throw new UserIsNotActivatedException();
    }
    if (!user.hasPassword) {
      throw new UserActionNeedsPassword();
    }
    return await this.otpService.createOtp({
      userId: user.id,
      channel: OtpChannelEnum.Email,
      reason: OtpReasonEnum.Verify,
    });
  }

  async resetPassword(vid: string, code: string, password: string) {
    return await this.ds.transaction(async (manager) => {
      let otp = await this.otpService.find({ id: vid, code: code });
      await this.otpService.delete(vid, code, manager.getRepository(Otp));
      await manager.getRepository(AuthProvider).update(
        {
          user: { id: otp!.user!.id },
          type: AuthProviderTypeEnum.password,
        },
        { passwordHash: await hashPassword(password, 10) },
      );
    });
  }

  async verifyEmail(vid: string, code: string, userId: string) {
    return await this.ds.transaction(async (manager) => {
      let otp = await this.otpService.find({
        id: vid,
        code: code,
        user: {
          id: userId,
        },
      });
      await this.otpService.delete(vid, code, manager.getRepository(Otp));
      let user = await this.findOne({ id: otp!.user!.id });
      user!.isEmailVerified = true;
      await manager.getRepository(User).save(user!);
      return user;
    });
  }
}
