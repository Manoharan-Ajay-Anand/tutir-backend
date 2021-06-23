import { HttpStatus } from '@nestjs/common';
import { AppError } from '../app.error';

export class UnsupportedFileError extends AppError {
  constructor() {
    super(HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'unsupported_file_type');
  }
}
