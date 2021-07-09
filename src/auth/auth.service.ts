import { Injectable } from '@nestjs/common';
import { UserView } from '../user/user.schema';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginFailedError, UserExistsError } from './auth.error';
import { Types } from 'mongoose';

export const SESSION_TOKEN_EXPIRY_SEC = 2 * 60 * 60;

export const REFRESH_TOKEN_EXPIRY_SEC = 2 * 24 * 60 * 60;

export interface AppSession {
  refresh: {
    token: string;
    expiry: number;
  };
  session: {
    token: string;
    expiry: number;
    refreshExpiry: number;
  };
  user: any;
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createUser(name: string, email: string, password: string) {
    const user = await this.userService.findOne(undefined, email);
    if (user) {
      throw new UserExistsError();
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await this.userService.createUser(name, email, passwordHash);
  }

  async validateUser(
    id: Types.ObjectId,
    email: string,
    password: string,
  ): Promise<UserView> {
    const user = await this.userService.findOne(id, email);
    if (!user) {
      throw new LoginFailedError();
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new LoginFailedError();
    }
    return this.userService.convertToView(user);
  }

  createSession(user: any, rememberMe: boolean): AppSession {
    const currentDate = Date.now();
    const sessionExpiryMs =
      (Math.floor(currentDate / 1000) + SESSION_TOKEN_EXPIRY_SEC) * 1000;
    const refreshExpiryMs = rememberMe
      ? (Math.floor(currentDate / 1000) + REFRESH_TOKEN_EXPIRY_SEC) * 1000
      : sessionExpiryMs;
    const sessionPayload = { id: user.id, exp: sessionExpiryMs / 1000 };
    const refreshPayload = { id: user.id, exp: refreshExpiryMs / 1000 };
    return {
      refresh: {
        token: rememberMe
          ? this.jwtService.sign(refreshPayload, {
              secret: process.env.APP_SECRET,
            })
          : null,
        expiry: refreshExpiryMs,
      },
      session: {
        token: this.jwtService.sign(sessionPayload, {
          secret: process.env.APP_SECRET,
        }),
        expiry: sessionExpiryMs,
        refreshExpiry: refreshExpiryMs,
      },
      user: user,
    };
  }
}
