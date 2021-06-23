import { HttpStatus } from '@nestjs/common';
import { AppError } from 'src/app.error';

export class VideoNotFoundError extends AppError {
  constructor() {
    super(HttpStatus.NOT_FOUND, 'video_not_found');
  }
}
