import { Injectable } from '@nestjs/common';
import { UserView } from 'src/user/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './strategy/session.strategy';

export interface AppSession {
  refresh: string;
  session: {
    token: string;
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
    return {
      refresh: this.jwtService.sign(
        { id: user.id },
        {
          secret: process.env.APP_SECRET,
          expiresIn: '2d',
        },
      ),
      session: {
        token: this.jwtService.sign(user, {
          secret: process.env.APP_SECRET,
          expiresIn: '60s',
        }),
        user: user,
      },
    };
  }
}
