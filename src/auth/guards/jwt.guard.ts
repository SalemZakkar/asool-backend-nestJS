import { AuthGuard } from '@nestjs/passport';
import { AuthUnAuthenticatedException } from '../errors';

export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    if (!user || err) {
      throw new AuthUnAuthenticatedException();
    }
    return user;
  }
}
