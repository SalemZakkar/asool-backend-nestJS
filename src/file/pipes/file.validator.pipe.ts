import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { FileSizeNotAllowed, FileTypeNotAllowed } from '../errors';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  constructor(
    private readonly size?: number,
    private readonly types?: string[],
  ) {}
  transform(value: any, metadata: ArgumentMetadata) {
    console.log(value);
    if (this.size && value.size > this.size) {
      throw new FileSizeNotAllowed(value.size, this.size);
    }

    if (this.types && !this.types.includes(value.mimetype)) {
      throw new FileTypeNotAllowed(value.mimetype, this.types);
    }
    return value;
  }
}

export class ImageFileValidatorPipeline extends FileSizeValidationPipe {
  constructor() {
    super(10 * 1024 * 1024, ['image/png', 'image/jpeg', 'image/jpg']);
  }
}
