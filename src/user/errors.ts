import { HttpException } from '@nestjs/common';
import { ErrorsRecord } from 'core';

export class UserAlreadyExistsException extends HttpException {
  constructor() {
    super('User Already Exists', 400);
  }
}

export class UserNotVerifiedException extends HttpException {
  constructor() {
    super('User Not Verified', 403);
  }
}

export class UserAlreadyVerifiedException extends HttpException {
  constructor() {
    super('User Already Verified.', 400);
  }
}

export class UserActionNeedsPassword extends HttpException {
  constructor() {
    super('You Need Password For this Action', 400);
  }
}

export class UserIsNotActivatedException extends HttpException {
  constructor() {
    super('User Needs To Be Activated First', 400);
  }
}

export class UserAlreadyGoogleLinkedException extends HttpException {
  constructor() {
    super('User Already Have Google Linked', 400);
  }
}

ErrorsRecord.addErrors('user', [
  new UserAlreadyExistsException(),
  new UserNotVerifiedException(),
  new UserAlreadyVerifiedException(),
  new UserActionNeedsPassword(),
  new UserIsNotActivatedException(),
  new UserAlreadyGoogleLinkedException()
]);
