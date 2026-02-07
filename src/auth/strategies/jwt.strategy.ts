import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import {
  AuthUnAuthenticatedException,
} from '../errors';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT!,
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findOne({
      id: payload.id,
    });
    if (!user) {
      throw new AuthUnAuthenticatedException();
    }
    return user;
  }
}
