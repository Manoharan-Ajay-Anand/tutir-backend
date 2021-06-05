import { HttpStatus } from '@nestjs/common';
import { AppError } from '../app.error';

export class UserExistsError extends AppError {
  constructor() {
    super(HttpStatus.BAD_REQUEST, 'user_already_exists');
  }
}

export class LoginFailedError extends AppError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, 'auth_login_failed');
  }
}

export class SessionInvalidError extends AppError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, 'auth_session_invalid');
  }
}

export class RefreshFailedError extends AppError {
  constructor() {
    super(HttpStatus.UNAUTHORIZED, 'auth_refresh_failed');
  }
}
