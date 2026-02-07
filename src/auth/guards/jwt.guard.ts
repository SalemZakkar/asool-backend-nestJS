import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { AuthAccountNotVerifiedException } from '../errors';

export function AuthVerificationGuard(): Type<CanActivate> {
  class EmailVerifiedGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      if (!user?.emailVerified) {
        throw new AuthAccountNotVerifiedException();
      }

      return true;
    }
  }

  return mixin(EmailVerifiedGuardMixin);
}
