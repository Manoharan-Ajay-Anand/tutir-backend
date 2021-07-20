import { HttpStatus } from '@nestjs/common';
import { AppError } from '../../app.error';

export class CannotTipError extends AppError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'cannot_tip');
  }
}

export class CannotCancelTipError extends AppError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, 'cannot_cancel_tip');
  }
}
