import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../app.error';

export class UserOnboardedError extends AppError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'user_onboarded');
  }
}
