import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InvalidParamsError } from '../app.error';
import { RefreshFailedError, SessionInvalidError } from './auth.error';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new InvalidParamsError();
    }
    return user;
  }
}

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new SessionInvalidError();
    }
    return user;
  }
}

@Injectable()
export class OptionalSessionAuthGuard extends AuthGuard('session') {
  handleRequest(err, user) {
    if (err) {
      throw err;
    }
    return user;
  }
}

@Injectable()
export class RefreshAuthGuard extends AuthGuard('refresh') {
  handleRequest(err, user) {
    if (err || !user) {
      throw err || new RefreshFailedError();
    }
    return user;
  }
}
