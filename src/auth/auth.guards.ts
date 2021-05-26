import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppError } from 'src/response/appError';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new AppError(HttpStatus.BAD_REQUEST, 'invalid_params');
    }
    return user;
  }
}

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
  handleRequest(err, user) {
    if (err || !user) {
      throw (
        err || new AppError(HttpStatus.UNAUTHORIZED, 'auth_session_invalid')
      );
    }
    return user;
  }
}

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new AppError(HttpStatus.UNAUTHORIZED, 'auth_refresh_failed');
    }
    return user;
  }
}
