import { HttpException } from '@nestjs/common';
import { ErrorsRecord } from 'core';

export class OtpWrongCodeException extends HttpException {
  constructor() {
    super('Wrong Otp Code', 400);
  }
}

ErrorsRecord.addErrors('otp', [new OtpWrongCodeException()]);
