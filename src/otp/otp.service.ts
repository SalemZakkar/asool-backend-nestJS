import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, DataSource, DeepPartial } from 'typeorm';
import { OtpReasonEnum } from './entity/enum/otpreason.enum';
import { OtpChannelEnum } from './entity/enum/otpchannel.enum';
import { Otp } from './entity/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OtpWrongCodeException } from './errors';
import { User } from '../user/entities/user.entity';

@Injectable()
export class OtpService {
  constructor(@InjectRepository(Otp) private readonly repo: Repository<Otp>) {}
  async createOtp(data: {
    userId: string;
    reason: OtpReasonEnum;
    channel: OtpChannelEnum;
  }) {
    let current = await this.repo.findOne({
      where: {
        user: { id: data.userId },
        reason: data.reason,
        channel: data.channel,
      },
    });
    if (current) {
      if (current.canResend) {
        if (current.attempts >= Otp.MAX_ATTEMPTS) {
          current.attempts = 1;
        } else {
          current.attempts++;
        }
        current.date = new Date();
        current.code = '123456';
        await this.repo.update({ id: current.id }, current);
        return {
          sent: true,
          vid: current.id,
          nextAttempt: current.nextDate.toISOString(),
        };
      } else {
        return { sent: false, nextAttempt: current.nextDate.toISOString() };
      }
    } else {
      let code = '123456';
      let res = this.repo.create({
        code: code,
        user: { id: data.userId },
        channel: data.channel,
        reason: data.reason,
      });
      await this.repo.save(res);
      return {
        sent: true,
        vid: res.id,
        nextAttempt: res.nextDate.toISOString(),
      };
    }
  }

  async find(params: DeepPartial<Otp>) {
    return this.repo.findOne({
      where: {
        reason: params.reason,
        channel: params.channel,
        id: params.id,
        user: params.user?.id ? { id: params.user?.id } : undefined,
      },
      relations: ["user"]
    });
  }

  async delete(vid: string, code: string, repo: Repository<Otp>) {
    let res = await repo.delete({ id: vid, code: code });
    if (!res.affected) {
      throw new OtpWrongCodeException();
    }
  }
}
