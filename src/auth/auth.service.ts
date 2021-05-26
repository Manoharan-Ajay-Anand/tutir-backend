import { Injectable } from '@nestjs/common';
import { UserView } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

export interface AppSession {
  refresh: {
    token: string;
    expiry: number;
  };
  session: {
    token: string;
    expiry: number;
    refreshExpiry: number;
    user: any;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async createUser(name: string, email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    await this.userService.createUser(name, email, passwordHash);
  }

  async validateUser(
    id: string | undefined,
    email: string | undefined,
    password: string,
  ): Promise<UserView> {
    const user = await this.userService.findOne(id, email);
    if (!user) {
      return null;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return null;
    }
    return this.userService.convertToView(user);
  }

  createSession(user: any): AppSession {
    const currentDate = Date.now();
    const sessionExpiryMs =
      (Math.floor(currentDate / 1000) + 2 * 60 * 60) * 1000;
    const refreshExpiryMs =
      (Math.floor(currentDate / 1000) + 2 * 24 * 60 * 60) * 1000;
    const sessionPayload = { user: user, exp: sessionExpiryMs / 1000 };
    const refreshPayload = { id: user.id, exp: refreshExpiryMs / 1000 };
    return {
      refresh: {
        token: this.jwtService.sign(refreshPayload, {
          secret: process.env.APP_SECRET,
        }),
        expiry: refreshExpiryMs,
      },
      session: {
        token: this.jwtService.sign(sessionPayload, {
          secret: process.env.APP_SECRET,
        }),
        expiry: sessionExpiryMs,
        refreshExpiry: refreshExpiryMs,
        user: user,
      },
    };
  }
}
