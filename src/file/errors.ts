import { HttpException } from '@nestjs/common';
import { ErrorsRecord } from 'core';

export class FileSizeNotAllowed extends HttpException {
  constructor(size?: number, foundedSize?: number) {
    super(
      size && foundedSize
        ? `File Size Too Big ${size} must be less than or equal ${foundedSize}`
        : 'File Size Too Big',
      400,
      {
        description:
          size && foundedSize
            ? `${foundedSize} must be less than or equal ${size}`
            : undefined,
      },
    );
  }
}

export class FileTypeNotAllowed extends HttpException {
  constructor(type?: string, types?: string[]) {
    console.log(types, type);
    super(
      types
        ? `File Not Allowed ${type} must be one of ${types}`
        : 'File Not Allowed',
      400,
    );
  }
}

ErrorsRecord.addErrors('file', [
  new FileTypeNotAllowed(),
  new FileTypeNotAllowed(),
]);
